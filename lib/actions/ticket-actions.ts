"use server";

import { db } from "@/lib/db";
import { tickets, ticketMessages, properties, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { deleteFilesFromR2 } from "./uploads";
import { revalidatePath } from "next/cache";
import { sendTicketNotification } from "@/lib/emails/ticket-notifications";

export async function createTicket(data: {
    title: string;
    type: "support" | "billing_issue" | "report_property" | "other";
    message: string;
    transactionId?: string | null;
    propertyId?: string | null;
    fileUrls?: string[];
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const result = await db.transaction(async (tx) => {
            // Generate a 10-digit ticket number (YYMMXXXXXX)
            const date = new Date();
            const yy = String(date.getFullYear()).slice(2);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
            const generatedTicketNumber = `${yy}${mm}${randomStr}`;

            const [newTicket] = await tx.insert(tickets).values({
                ticketNumber: generatedTicketNumber,
                title: data.title,
                type: data.type,
                userId: session.user.id as string,
                transactionId: data.transactionId || null,
                propertyId: data.propertyId || null,
                status: "open",
            }).returning({ id: tickets.id, ticketNumber: tickets.ticketNumber });

            await tx.insert(ticketMessages).values({
                ticketId: newTicket.id,
                senderId: session.user.id as string,
                message: data.message,
                fileUrls: data.fileUrls || [],
            });

            return { id: newTicket.id, ticketNumber: newTicket.ticketNumber };
        });

        revalidatePath("/dashboard/inquiries");
        revalidatePath("/admin/inquiries");
        return { success: true, ticketId: result.id, ticketNumber: result.ticketNumber };
    } catch (error) {
        console.error("Create ticket error:", error);
        return { success: false, error: "Failed to create ticket" };
    }
}

export async function sendTicketMessage(data: {
    ticketId: string;
    message: string;
    fileUrls?: string[];
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await db.insert(ticketMessages).values({
            ticketId: data.ticketId,
            senderId: session.user.id as string,
            message: data.message,
            fileUrls: data.fileUrls || [],
        });

        await db.update(tickets)
            .set({ updatedAt: new Date() })
            .where(eq(tickets.id, data.ticketId));

        const [ticket] = await db.select()
            .from(tickets).where(eq(tickets.id, data.ticketId));

        if (ticket) {
            // Notification logic: If admin replies to user's ticket
            if (session.user.role === 'admin' && ticket.userId !== session.user.id) {
                const now = new Date();
                const lastSent = ticket.lastNotificationSent ? new Date(ticket.lastNotificationSent) : null;
                const threeHoursInMs = 3 * 60 * 60 * 1000;

                if (!lastSent || (now.getTime() - lastSent.getTime() >= threeHoursInMs)) {
                    // Fetch user
                    const [user] = await db.select().from(users).where(eq(users.id, ticket.userId));

                    if (user && user.email) {
                        // Fetch last 3 messages
                        const recentMsgs = await db.select()
                            .from(ticketMessages)
                            .where(eq(ticketMessages.ticketId, data.ticketId))
                            .orderBy(desc(ticketMessages.createdAt))
                            .limit(3);

                        // Reverse to chronological order for email
                        const formattedMessages = recentMsgs.reverse().map(msg => ({
                            sender: msg.senderId === user.id ? user.name || 'User' : 'Admin',
                            content: msg.message
                        }));

                        await sendTicketNotification({
                            userName: user.name || 'User',
                            userEmail: user.email,
                            userPhone: user.phoneNumber || '',
                            ticketNumber: ticket.ticketNumber,
                            title: ticket.title,
                            messages: formattedMessages
                        });

                        // Update lastNotificationSent
                        await db.update(tickets)
                            .set({ lastNotificationSent: now })
                            .where(eq(tickets.id, data.ticketId));
                    }
                }
            }

            revalidatePath(`/dashboard/inquiries/${ticket.ticketNumber}`);
            revalidatePath(`/admin/inquiries/${ticket.ticketNumber}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Send message error:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function toggleTicketStatus(ticketId: string, newStatus: "open" | "closed") {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await db.transaction(async (tx) => {
            await tx.update(tickets)
                .set({ status: newStatus, updatedAt: new Date() })
                .where(eq(tickets.id, ticketId));

            await tx.insert(ticketMessages).values({
                ticketId: ticketId,
                senderId: session.user.id as string,
                message: `System: Ticket was marked as ${newStatus}.`,
            });
        });

        const [ticket] = await db.select({ ticketNumber: tickets.ticketNumber })
            .from(tickets).where(eq(tickets.id, ticketId));

        if (ticket) {
            revalidatePath(`/dashboard/inquiries/${ticket.ticketNumber}`);
            revalidatePath(`/admin/inquiries/${ticket.ticketNumber}`);
        }
        revalidatePath("/dashboard/inquiries");
        revalidatePath("/admin/inquiries");
        return { success: true };
    } catch (error) {
        console.error("Toggle ticket error:", error);
        return { success: false, error: "Failed to update ticket status" };
    }
}

export async function purgeTicketAssets(ticketId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const msgs = await db.select({ fileUrls: ticketMessages.fileUrls })
            .from(ticketMessages)
            .where(eq(ticketMessages.ticketId, ticketId));

        let allUrls: string[] = [];
        for (const msg of msgs) {
            if (msg.fileUrls && Array.isArray(msg.fileUrls)) {
                allUrls.push(...(msg.fileUrls as string[]));
            }
        }

        if (allUrls.length > 0) {
            const result = await deleteFilesFromR2(allUrls);
            if (!result.success) {
                console.error("Failed to delete from R2.");
            }
        }

        await db.update(ticketMessages)
            .set({ fileUrls: [] })
            .where(eq(ticketMessages.ticketId, ticketId));

        const [ticket] = await db.select({ ticketNumber: tickets.ticketNumber })
            .from(tickets).where(eq(tickets.id, ticketId));

        if (ticket) {
            revalidatePath(`/admin/inquiries/${ticket.ticketNumber}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Purge ticket assets error:", error);
        return { success: false, error: "Failed to purge assets" };
    }
}

export async function deleteLinkedProperty(propertyId: string) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
            return { success: false, error: "Unauthorized" };
        }

        await db.update(properties)
            .set({ deletedAt: new Date(), status: 'inactive' })
            .where(eq(properties.id, propertyId));

        revalidatePath("/admin/properties");
        return { success: true };
    } catch (error) {
        console.error("Delete property error:", error);
        return { success: false, error: "Failed to delete property" };
    }
}
