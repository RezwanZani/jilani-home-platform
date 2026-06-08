import { db } from "@/lib/db";
import { tickets, ticketMessages, users, transactions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminThreadMessenger } from "./admin-thread-messenger";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminTicketThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
        redirect("/login");
    }

    const resolvedParams = await params;
    
    const [ticketData] = await db.select({
        ticket: tickets,
        userEmail: users.email,
        userName: users.name,
        transaction: transactions
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(transactions, eq(tickets.transactionId, transactions.id))
    .where(eq(tickets.ticketNumber, resolvedParams.id));

    if (!ticketData) {
        redirect("/admin/inquiries");
    }

    const { ticket, userEmail, userName, transaction } = ticketData;

    const messages = await db.select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticket.id))
        .orderBy(asc(ticketMessages.createdAt));

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4">
                <Link href="/admin/inquiries" className="text-sm text-muted-foreground flex items-center hover:text-foreground mb-4 w-fit">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Inquiries
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            <span className="text-blue-600 dark:text-blue-400 mr-2">#{ticket.ticketNumber}</span>
                            {ticket.title}
                        </h1>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center">
                            <span className="capitalize text-primary font-medium">{ticket.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Status: <span className={ticket.status === 'open' ? 'text-green-600 font-medium' : 'text-gray-500 font-medium'}>{ticket.status.toUpperCase()}</span></span>
                            <span>•</span>
                            <span>User: {userName} ({userEmail})</span>
                            {ticket.propertyId && (
                                <>
                                    <span>•</span>
                                    <span>Property ID: {ticket.propertyId}</span>
                                </>
                            )}
                            {ticket.transactionId && (
                                <>
                                    <span>•</span>
                                    <span>Tx ID: {ticket.transactionId}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {transaction && (
                <div className="mb-4 bg-muted/30 border rounded-lg p-3 text-sm flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Linked Transaction:</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Invoice</span>
                            <span className="font-medium">{transaction.invoiceNumber}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Amount</span>
                            <span className="font-medium">৳{transaction.amountPaid}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Gateway</span>
                            <span className="font-medium capitalize">{transaction.gateway || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
                            <span className="font-medium capitalize">{transaction.status}</span>
                        </div>
                    </div>
                </div>
            )}

            <AdminThreadMessenger 
                ticket={ticket} 
                messages={messages} 
                currentUserId={session.user.id} 
            />
        </div>
    );
}
