'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- NEW: Import createPortal
import { Lock, MapPin, Phone, Mail, Shield, CheckCircle2, AlertCircle, X, Wallet, Unlock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { unlockPropertyContact } from '@/lib/actions/unlock-actions';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsApp } from '@/lib/icons/social-media'

type ContactInfoRevealProps = {
    propertyId: string;
    hasUnlockedInitially: boolean;
    zone: { name?: string | null; city?: string | null; thana?: string | null; area?: string | null } | null;
    initialContactData: {
        ownerName: string;
        phone: string;
        whatsapp: string;
        house: string;
        road: string;
        block: string;
        landmark: string;
        additionalLine: string;
    } | null;
    isLoggedIn: boolean;
    approximateArea: string;
    userBalance?: number;
};

const UNLOCK_COST = 50;

export default function ContactInfoReveal({ propertyId, hasUnlockedInitially, zone, initialContactData, isLoggedIn, approximateArea, userBalance = 0 }: ContactInfoRevealProps) {
    const [isUnlocked, setIsUnlocked] = useState(hasUnlockedInitially);

    const renderedContactData1 = `${initialContactData?.house}, ${initialContactData?.road}, ${initialContactData?.block}, ${initialContactData?.landmark}`
    const renderedContactData2 = `${initialContactData?.additionalLine}`
    const renderedContactData3 = `${zone?.thana}, ${zone?.area}, ${zone?.city}`

    const [contactData, setContactData] = useState(initialContactData);

    // Modal & Loading States
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // NEW: Track when component mounts so we can safely use document.body for the Portal
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleConfirmUnlock = async () => {
        setIsLoading(true);
        const result = await unlockPropertyContact(propertyId);

        if (result.success) {
            setContactData(result.data ?? null);
            setIsUnlocked(true);
            setShowModal(false); // Close modal on success
            toast.success("Contact info unlocked successfully!");
        } else {
            toast.error(result.error === "INSUFFICIENT_FUNDS" ? "Insufficient funds." : "Failed to unlock property.");
        }
        setIsLoading(false);
    };

    // If already unlocked, show the real data
    if (isUnlocked) {
        return (
            <div className="bg-[#141414] border border-[#3B82F6]/30 rounded-xl overflow-hidden mb-4 p-5 space-y-4">
                <div className="flex items-center gap-2 text-[#3B82F6] mb-2 border-b border-white/5 pb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold text-sm">Contact Info Unlocked</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-500" />
                    <span>{renderedContactData1 ?? "Detailed address not provided."} <br /> {renderedContactData2 ?? ""} <br /> {renderedContactData3 ?? ""} </span>
                </div>
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                    <Phone className="w-4 h-4 shrink-0 text-blue-500" />
                    <a href={`tel:${contactData?.phone}`}><span className='hover:text-blue-400 transition-colors'>{contactData?.phone || "N/A"}</span></a>
                </div>
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                    <MessageCircle className="w-4 h-4 shrink-0 text-green-500" />
                    <a href={`https://wa.me/+88${contactData?.whatsapp}`}><span className='hover:text-green-400 transition-colors'>{contactData?.whatsapp || "N/A"}</span></a>
                </div>
            </div>
        );
    }

    // THE MODAL UI (To be Portaled)
    const modalContent = (
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => !isLoading && setShowModal(false)}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[#111111] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full z-10"
                    >
                        <button onClick={() => !isLoading && setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        {/* STATE 1: NOT LOGGED IN */}
                        {!isLoggedIn ? (
                            <div className="text-center pt-2">
                                <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">Authentication Required</h3>
                                <p className="text-gray-400 text-sm mb-6">You must log in or create an account to securely unlock and view private property details.</p>

                                <div className="flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setShowModal(false)}>
                                        <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl transition-colors">Log In</button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setShowModal(false)}>
                                        <button className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 font-semibold py-2.5 rounded-xl transition-colors">Sign Up</button>
                                    </Link>
                                </div>
                            </div>
                        ) :

                            /* STATE 2: LOGGED IN (Determine if sufficient balance) */
                            (
                                <div className="text-center pt-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${userBalance >= UNLOCK_COST ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {userBalance >= UNLOCK_COST ? <Unlock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">Unlock Property</h3>
                                    <p className="text-gray-400 text-sm mb-4">Access the exact address and direct contact numbers for this owner.</p>

                                    {/* Receipt / Balance Box */}
                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-4 text-sm">
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                                            <span className="text-gray-400">Unlock Cost</span>
                                            <span className="text-white font-semibold">{UNLOCK_COST} Points</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Your Balance</span>
                                            <span className={`font-semibold ${userBalance >= UNLOCK_COST ? 'text-[#3B82F6]' : 'text-amber-500'}`}>
                                                {userBalance} Points
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expiry Warning */}
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mb-6">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Access remains active for exactly 2 months.
                                    </p>

                                    {/* Action Buttons based on balance */}
                                    {userBalance >= UNLOCK_COST ? (
                                        <button
                                            onClick={handleConfirmUnlock}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                                        >
                                            {isLoading ? "Processing..." : "Confirm & Unlock"}
                                        </button>
                                    ) : (
                                        <Link href="/pricing" onClick={() => setShowModal(false)}>
                                            <button className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold py-3 rounded-xl transition-colors">
                                                <Wallet className="w-4 h-4" /> Top up Wallet to Unlock
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* The Locked UI state */}
            <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden mb-4">
                <div className="p-4 space-y-4 blur-[5px] select-none pointer-events-none opacity-50">
                    <div className="flex items-center gap-2.5 text-gray-400 text-sm"><MapPin className="w-4 h-4 shrink-0" /><span>House 12, Road 6, {approximateArea}</span></div>
                    <div className="flex items-center gap-2.5 text-gray-400 text-sm"><Phone className="w-4 h-4 shrink-0" /><span>+880 1711-234567</span></div>
                    <div className="flex items-center gap-2.5 text-gray-400 text-sm"><Mail className="w-4 h-4 shrink-0" /><span>contact@venue.com</span></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[2px] gap-3 p-4">
                    <div className="flex items-center gap-1.5 text-gray-300 text-xs text-center">
                        <Lock className="w-4 h-4 text-[#3B82F6] shrink-0" />
                        <span>Exact address & contacts are hidden</span>
                    </div>

                    {/* The Trigger Button - Always opens the modal */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-[0_0_14px_rgba(59,130,246,0.35)]"
                    >
                        <Shield className="w-4 h-4" /> Unlock Contact Info
                    </button>
                </div>
            </div>

            {/* NEW: Teleport the modal to the body so it completely overrides the sidebar CSS */}
            {isMounted && createPortal(modalContent, document.body)}
        </>
    );
}