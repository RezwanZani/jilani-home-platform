'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Share2, X, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner'; // Assuming you are using sonner for toasts

type ShareButtonProps = {
    title: string;
};

export default function ShareButton({ title }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState('');

    // Safely get the current URL only on the client side
    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    // Social sharing links
    const shareTargets = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-7 h-7 text-green-500" />,
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            bgColor: 'bg-green-500/10 hover:bg-green-500/20'
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-7 h-7 text-blue-500" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-7 h-7 text-blue-400" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            bgColor: 'bg-blue-400/10 hover:bg-blue-400/20'
        },
        {
            name: 'X (Twitter)',
            icon: <Twitter className="w-7 h-7 text-gray-300" />,
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            bgColor: 'bg-gray-500/10 hover:bg-gray-500/20'
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link.");
        }
    };

    return (
        <>
            {/* THE TRIGGER BUTTON */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 bg-[#141414] border border-white/[0.08] text-gray-300 hover:text-white text-sm px-4 py-2 rounded-xl transition-all hover:border-white/20"
            >
                <Share2 className="w-4 h-4" /> Share
            </button>

            {/* THE SHARE MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-[#111111] border border-white/[0.08] p-6 rounded-3xl shadow-2xl max-w-md w-full z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white font-heading">Share this space</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* YouTube-Style Horizontal Scrolling Icons */}
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                                {shareTargets.map((target) => (
                                    <a
                                        key={target.name}
                                        href={target.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 shrink-0 snap-start group"
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors border border-white/[0.05] ${target.bgColor}`}>
                                            {target.icon}
                                        </div>
                                        <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                                            {target.name}
                                        </span>
                                    </a>
                                ))}
                            </div>

                            {/* Copy Link Bar */}
                            <div className="mt-2 bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-1.5 flex items-center justify-between">
                                <div className="overflow-hidden px-3">
                                    <p className="text-sm text-gray-400 truncate whitespace-nowrap">
                                        {url}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
