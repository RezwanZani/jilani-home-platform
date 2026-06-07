import { db } from "@/lib/db";
import { tickets, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function AdminInquiriesPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
        redirect("/login");
    }

    const allTickets = await db.select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        title: tickets.title,
        type: tickets.type,
        status: tickets.status,
        createdAt: tickets.createdAt,
        userEmail: users.email,
        userName: users.name
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .orderBy(
        sql`CASE WHEN ${tickets.status} = 'open' THEN 1 ELSE 2 END`,
        desc(tickets.createdAt)
    );

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiries Dashboard</h1>

            <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/5">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">User</th>
                            <th className="px-4 py-3 text-left font-medium">Ticket #</th>
                            <th className="px-4 py-3 text-left font-medium">Title</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-right font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {allTickets.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/5 last:border-0">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900 dark:text-white">{t.userName || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.userEmail}</div>
                                </td>
                                <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                                    #{t.ticketNumber}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.title}</td>
                                <td className="px-4 py-3 capitalize">{t.type.replace('_', ' ')}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'}`}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                    {format(new Date(t.createdAt), "MMM d, yyyy")}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/inquiries/${t.ticketNumber}`}>
                                            Manage
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allTickets.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No inquiries found.
                    </div>
                )}
            </div>
        </div>
    );
}
