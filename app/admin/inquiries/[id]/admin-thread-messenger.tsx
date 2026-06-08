"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendTicketMessage, toggleTicketStatus, purgeTicketAssets, deleteLinkedProperty } from "@/lib/actions/ticket-actions";
import { getPresignedR2Url } from "@/lib/actions/uploads";
import { toast } from "sonner";
import { Loader2, Send, Paperclip, Trash2, Ban, LockOpen, Lock } from "lucide-react";
import { format } from "date-fns";
import DOMPurify from 'isomorphic-dompurify';

export function AdminThreadMessenger({ ticket, messages, currentUserId }: { ticket: any, messages: any[], currentUserId: string }) {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() && !file) return;
        setLoading(true);

        try {
            let fileUrls: string[] = [];

            if (file && file.size > 0) {
                const { success, uploadUrl, finalUrl } = await getPresignedR2Url(file.name, file.type);
                if (success && uploadUrl && finalUrl) {
                    const res = await fetch(uploadUrl, {
                        method: "PUT",
                        body: file,
                        headers: { "Content-Type": file.type }
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

            const result = await sendTicketMessage({
                ticketId: ticket.id,
                message,
                fileUrls
            });

            if (result.success) {
                setMessage("");
                setFile(null);
            } else {
                toast.error(result.error || "Failed to send message");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setActionLoading('status');
        const newStatus = ticket.status === 'open' ? 'closed' : 'open';
        const res = await toggleTicketStatus(ticket.id, newStatus);
        if (res.success) toast.success(`Ticket ${newStatus}`);
        else toast.error("Failed to toggle status");
        setActionLoading(null);
    };

    const handlePurge = async () => {
        if (!confirm("Are you sure you want to permanently delete all file attachments in this thread?")) return;
        setActionLoading('purge');
        const res = await purgeTicketAssets(ticket.id);
        if (res.success) toast.success("Assets purged");
        else toast.error("Failed to purge assets");
        setActionLoading(null);
    };

    const handleDeleteProperty = async () => {
        if (!confirm("Are you sure you want to mark the linked property as deleted?")) return;
        setActionLoading('property');
        const res = await deleteLinkedProperty(ticket.propertyId);
        if (res.success) toast.success("Property marked as deleted");
        else toast.error("Failed to delete property");
        setActionLoading(null);
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden shadow-sm min-h-[500px]">
            {/* Admin Header Actions */}
            <div className="bg-gray-50 dark:bg-white/[0.02] p-3 border-b border-gray-200 dark:border-white/5 flex justify-between items-center flex-wrap gap-3">
                <div className="text-sm font-semibold flex items-center gap-2">
                    Admin Actions
                </div>
                <div className="flex flex-wrap gap-2">
                    {ticket.propertyId && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteProperty}
                            disabled={actionLoading === 'property'}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {actionLoading === 'property' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                            Delete Property Link
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePurge}
                        disabled={actionLoading === 'purge'}
                    >
                        {actionLoading === 'purge' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Purge Files
                    </Button>
                    <Button
                        variant={ticket.status === 'open' ? 'outline' : 'default'}
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={actionLoading === 'status'}
                    >
                        {actionLoading === 'status' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                            ticket.status === 'open' ? <Lock className="w-4 h-4 mr-2" /> : <LockOpen className="w-4 h-4 mr-2" />
                        )}
                        {ticket.status === 'open' ? 'Close Conversation' : 'Re-Open Conversation'}
                    </Button>
                </div>
            </div>

            {/* Message Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isSystem = msg.message.startsWith("System:");
                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                                    {msg.message}
                                </span>
                            </div>
                        );
                    }

                    const isMe = msg.senderId === currentUserId;
                    const safeMessage = DOMPurify.sanitize(msg.message);

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-gray-900 text-gray-100 dark:bg-blue-800 dark:text-white rounded-br-none' : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-none'}`}>
                                <div
                                    className="whitespace-pre-wrap text-sm"
                                    dangerouslySetInnerHTML={{ __html: safeMessage }}
                                />

                                {msg.fileUrls && msg.fileUrls.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {msg.fileUrls.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block text-xs underline opacity-80 hover:opacity-100">
                                                Attachment {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-500 dark:text-gray-400 text-left'}`}>
                                    {format(new Date(msg.createdAt), "h:mm a")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/5">
                {ticket.status === 'closed' ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                        <p className="font-medium text-sm">This conversation is locked.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 bg-white hover:bg-yellow-100 border-yellow-300 text-yellow-900"
                            onClick={handleToggleStatus}
                            disabled={actionLoading !== null}
                        >
                            {actionLoading === 'status' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Re-Open Ticket
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-end gap-2">
                        <div className="flex-1 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-lg focus-within:ring-1 focus-within:ring-blue-500">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message as an agent..."
                                className="border-0 focus-visible:ring-0 resize-none min-h-[60px] p-3 shadow-none bg-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            {file && (
                                <div className="px-3 py-2 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                                    <span>{file.name}</span>
                                    <button onClick={() => setFile(null)} className="text-red-500 hover:underline">Remove</button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer">
                                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                            <Button size="icon" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSend} disabled={loading || (!message.trim() && !file)}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
