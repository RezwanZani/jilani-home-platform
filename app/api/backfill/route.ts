import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { isNull, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const existingTickets = await db.select().from(tickets).where(isNull(tickets.ticketNumber));
        let count = 0;
        for (const ticket of existingTickets) {
            const date = new Date(ticket.createdAt);
            const yy = String(date.getFullYear()).slice(2);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
            const generatedTicketNumber = `${yy}${mm}${randomStr}`;

            await db.update(tickets)
                .set({ ticketNumber: generatedTicketNumber })
                .where(eq(tickets.id, ticket.id));
            count++;
        }
        return NextResponse.json({ success: true, message: `Backfilled ${count} tickets` });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
