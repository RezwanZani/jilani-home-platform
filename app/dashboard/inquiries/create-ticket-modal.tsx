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
import { Loader2 } from "lucide-react";

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
                <Button>New Ticket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" required placeholder="Briefly describe your issue..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select name="type" required defaultValue="support">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="support">General Support</SelectItem>
                                <SelectItem value="billing_issue">Billing Issue</SelectItem>
                                <SelectItem value="report_property">Report Property</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Link Transaction (Optional)</label>
                        <Select name="transactionId" defaultValue="none">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a transaction if applicable" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {recentTransactions.map(tx => (
                                    <SelectItem key={tx.id} value={tx.id}>
                                        {tx.invoiceNumber} - ৳{tx.amountPaid}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea name="message" required placeholder="Detailed explanation..." rows={4} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Attachment (Optional)</label>
                        <Input type="file" name="file" />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit Ticket
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
