'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Unlock, Shield, AlertCircle, X, Wallet, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { unlockPropertyContact } from '@/lib/actions/unlock-actions';

type CardUnlockButtonProps = {
    propertyId: string;
    isUnlockedInitially: boolean;
    isLoggedIn: boolean;
    userBalance: number;
};

const UNLOCK_COST = 50;

export default function CardUnlockButton({ propertyId, isUnlockedInitially, isLoggedIn, userBalance }: CardUnlockButtonProps) {
    const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitially);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const handleConfirmUnlock = async () => {
        setIsLoading(true);
        const result = await unlockPropertyContact(propertyId);

        if (result.success) {
            setIsUnlocked(true);
            setShowModal(false);
            toast.success("Property unlocked! Click the card to view owner details.");
        } else {
            toast.error(result.error === "INSUFFICIENT_FUNDS" ? "Insufficient funds." : "Failed to unlock.");
        }
        setIsLoading(false);
    };

    // The Unified Smart Modal (Portaled to document.body)
    const modalContent = (
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isLoading && setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#111111] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full z-10">
                        <button onClick={() => !isLoading && setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

                        {!isLoggedIn ? (
                            <div className="text-center pt-2">
                                <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6" /></div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">Log in required</h3>
                                <p className="text-gray-400 text-sm mb-6">Create an account to securely unlock private property details.</p>
                                <div className="flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setShowModal(false)}><button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl transition-colors">Log In</button></Link>
                                    <Link href="/signup" onClick={() => setShowModal(false)}><button className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 font-semibold py-2.5 rounded-xl transition-colors">Sign Up</button></Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pt-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${userBalance >= UNLOCK_COST ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {userBalance >= UNLOCK_COST ? <Unlock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">Unlock Property</h3>
                                <p className="text-gray-400 text-sm mb-4">Unlock this card to access the owner's exact address and phone number.</p>
                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-4 text-sm">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5"><span className="text-gray-400">Unlock Cost</span><span className="text-white font-semibold">{UNLOCK_COST} Points</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400">Your Balance</span><span className={`font-semibold ${userBalance >= UNLOCK_COST ? 'text-[#3B82F6]' : 'text-amber-500'}`}>{userBalance} Points</span></div>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mb-6"><CheckCircle2 className="w-3.5 h-3.5" /> Access remains active for 2 months.</p>

                                {userBalance >= UNLOCK_COST ? (
                                    <button onClick={handleConfirmUnlock} disabled={isLoading} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                                        {isLoading ? "Processing..." : "Confirm & Unlock"}
                                    </button>
                                ) : (
                                    <Link href="/pricing" onClick={() => setShowModal(false)}>
                                        <button className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3 rounded-xl transition-colors">Top up Wallet</button>
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
            <button
                onClick={(e) => {
                    e.preventDefault(); // Prevents clicking the card link
                    e.stopPropagation();
                    if (!isUnlocked) setShowModal(true);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition-all border ${isUnlocked
                        ? 'bg-green-500/20 border-green-500/30 text-green-400 cursor-default'
                        : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                    }`}
                title={isUnlocked ? "Unlocked" : "Unlock Contact Info"}
            >
                {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>

            {isMounted && createPortal(modalContent, document.body)}
        </>
    );
}
