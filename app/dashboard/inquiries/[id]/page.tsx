import { db } from "@/lib/db";
import { tickets, ticketMessages, transactions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThreadMessenger } from "./thread-messenger";

export default async function TicketThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await params;
    
    const [data] = await db.select({
        ticket: tickets,
        transaction: transactions
    })
    .from(tickets)
    .leftJoin(transactions, eq(tickets.transactionId, transactions.id))
    .where(eq(tickets.ticketNumber, resolvedParams.id));

    if (!data || data.ticket.userId !== session.user.id) {
        redirect("/dashboard/inquiries");
    }

    const { ticket, transaction } = data;

    const messages = await db.select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticket.id))
        .orderBy(asc(ticketMessages.createdAt));

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">#{ticket.ticketNumber}</span>
                    {ticket.title}
                </h1>
                <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                    <span className="capitalize">Type: {ticket.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Status: <span className={ticket.status === 'open' ? 'text-green-600 font-medium' : 'text-gray-500 font-medium'}>{ticket.status.toUpperCase()}</span></span>
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

            <ThreadMessenger 
                ticket={ticket} 
                messages={messages} 
                currentUserId={session.user.id} 
            />
        </div>
    );
}
