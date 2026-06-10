"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTicket } from "@/lib/actions/ticket-actions";
import { getPresignedR2Url } from "@/lib/actions/uploads";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";
 
export function CreateTicketModal({ recentTransactions }: { recentTransactions: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
 
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
 
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const type = formData.get("type") as "support" | "billing_issue" | "report_property" | "other";
        const message = formData.get("message") as string;
        const txVal = formData.get("transactionId") as string;
        const transactionId = txVal === "none" ? null : txVal;
        const file = formData.get("file") as File;
 
        try {
            let fileUrls: string[] = [];
            
            if (file && file.size > 0) {
                // Pre-signed URL pattern
                const { success, uploadUrl, finalUrl } = await getPresignedR2Url(file.name, file.type);
                if (success && uploadUrl && finalUrl) {
                    const res = await fetch(uploadUrl, {
                        method: "PUT",
                        body: file,
                        headers: {
                            "Content-Type": file.type
                        }
                    });
                    if (res.ok) {
                        fileUrls.push(finalUrl);
                    } else {
                        toast.error("Failed to upload file");
                        setLoading(false);
                        return;
                    }
                } else {
                    toast.error("Failed to initialize file upload");
                    setLoading(false);
                    return;
                }
            }
 
            const result = await createTicket({
                title,
                type,
                message,
                transactionId,
                fileUrls
            });
 
            if (result.success) {
                toast.success("Ticket created!");
                setOpen(false);
                router.refresh();
                if (result.ticketNumber) {
                    router.push(`/dashboard/inquiries/${result.ticketNumber}`);
                }
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-600/10 gap-2">
                    <Ticket className="w-4 h-4" />
                    New Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Create Support Ticket</DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">Title *</label>
                        <Input
                            name="title"
                            required
                            placeholder="Briefly describe your issue..."
                            className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm focus-visible:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">Type *</label>
                        <Select name="type" required defaultValue="support">
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
                                <SelectItem value="support" className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">General Support</SelectItem>
                                <SelectItem value="billing_issue" className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">Billing Issue</SelectItem>
                                <SelectItem value="report_property" className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">Report Property</SelectItem>
                                <SelectItem value="other" className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">Link Transaction (Optional)</label>
                        <Select name="transactionId" defaultValue="none">
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm">
                                <SelectValue placeholder="Select a transaction if applicable" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
                                <SelectItem value="none" className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">None</SelectItem>
                                {recentTransactions.map(tx => (
                                    <SelectItem key={tx.id} value={tx.id} className="focus:bg-gray-100 dark:focus:bg-white/5 rounded-lg cursor-pointer">
                                        {tx.invoiceNumber} - ৳{tx.amountPaid}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">Message *</label>
                        <Textarea
                            name="message"
                            required
                            placeholder="Detailed explanation..."
                            rows={4}
                            className="rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-blue-500 focus:border-blue-500 transition-all p-3 shadow-sm resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">Attachment (Optional)</label>
                        <Input
                            type="file"
                            name="file"
                            className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm w-full file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 file:transition-colors cursor-pointer py-1.5 px-3"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Submit Ticket
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
