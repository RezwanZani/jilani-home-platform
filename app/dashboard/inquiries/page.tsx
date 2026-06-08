import { db } from "@/lib/db";
import { tickets, transactions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateTicketModal } from "./create-ticket-modal";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function InquiriesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const userTickets = await db.select()
        .from(tickets)
        .where(eq(tickets.userId, session.user.id))
        .orderBy(desc(tickets.createdAt));

    const userTransactions = await db.select()
        .from(transactions)
        .where(eq(transactions.userId, session.user.id))
        .orderBy(desc(transactions.createdAt))
        .limit(10);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Support Tickets</h1>
                <CreateTicketModal recentTransactions={userTransactions} />
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-5 text-sm space-y-3">
                <h2 className="font-semibold text-blue-900 dark:text-blue-100 text-base">কীভাবে এবং কেন সাপোর্ট টিকিট সিস্টেম ব্যবহার করবেন?</h2>
                
                <div className="space-y-1.5 text-blue-800 dark:text-blue-200/70">
                    <p><strong className="text-blue-900 dark:text-blue-100">কেন ব্যবহার করবেন?</strong> আপনার অ্যাকাউন্ট, বিলিং বা প্রপার্টি সংক্রান্ত যেকোনো সমস্যার দ্রুত সমাধানের জন্য এই সিস্টেমটি ব্যবহার করুন। এর মাধ্যমে আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করা যায়।</p>
                    <p className="mt-2"><strong className="text-blue-900 dark:text-blue-100">কীভাবে ব্যবহার করবেন?</strong></p>
                    <ul className="list-decimal list-inside space-y-1 ml-1">
                        <li>নতুন সমস্যা জানাতে উপরের <strong className="text-blue-900 dark:text-blue-100">"New Ticket"</strong> বাটনে ক্লিক করুন।</li>
                        <li>আপনার সমস্যার ধরন (Type) নির্বাচন করুন।</li>
                        <li>যদি সমস্যাটি কোনো নির্দিষ্ট পেমেন্টের সাথে সম্পর্কিত হয়, তবে <strong className="text-blue-900 dark:text-blue-100">Link Transaction</strong> থেকে সেটি নির্বাচন করুন।</li>
                        <li>সমস্যার বিস্তারিত বর্ণনা দিন এবং প্রয়োজনে কোনো স্ক্রিনশট বা ফাইল (Attachment) যুক্ত করুন।</li>
                        <li>টিকিট সাবমিট করার পর, এই পেজ থেকে আপনি আপনার টিকিটের অবস্থা (Status) দেখতে পারবেন এবং প্রয়োজনে সাপোর্ট টিমের সাথে মেসেজ আদান-প্রদান করতে পারবেন।</li>
                    </ul>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden shadow-sm">
                {userTickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center space-y-4">
                        <p>No tickets found. Need help? Open a new ticket!</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Ticket #</th>
                                <th className="px-4 py-3 text-left font-medium">Title</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                            {userTickets.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/5 last:border-0">
                                    <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                                        <Link href={`/dashboard/inquiries/${t.ticketNumber}`}>#{t.ticketNumber}</Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.title}</td>
                                    <td className="px-4 py-3 capitalize">{t.type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'}`}>
                                            {t.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {format(new Date(t.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/inquiries/${t.ticketNumber}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
