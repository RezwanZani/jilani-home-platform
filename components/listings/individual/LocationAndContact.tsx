'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Phone, MessageCircle, Lock, Shield, CheckCircle2, AlertCircle, X, Wallet, Unlock, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { unlockPropertyContact } from '@/lib/actions/unlock-actions';

type LocationAndContactProps = {
    propertyId: string;
    zone: { name?: string | null; city?: string | null; thana?: string | null; area?: string | null } | null;
    hasUnlockedInitially: boolean;
    initialContactData: any;
    isLoggedIn: boolean;
    userBalance: number;
};

const UNLOCK_COST = 50;

export default function LocationAndContact({ propertyId, zone, hasUnlockedInitially, initialContactData, isLoggedIn, userBalance }: LocationAndContactProps) {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(hasUnlockedInitially);
    const [contactData, setContactData] = useState(initialContactData);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const handleConfirmUnlock = async () => {
        setIsLoading(true);
        const result = await unlockPropertyContact(propertyId);

        if (result.success) {
            setContactData(result.data);
            setIsUnlocked(true);
            setShowModal(false);
            toast.success("Details unlocked successfully!");
            router.refresh(); // Syncs any other components on the page!
        } else {
            toast.error(result.error === "INSUFFICIENT_FUNDS" ? "Insufficient funds." : "Failed to unlock.");
        }
        setIsLoading(false);
    };

    const InfoRow = ({ label, value, isPrivate = false }: { label: string, value: string | undefined, isPrivate?: boolean }) => (
        <div className="flex items-start gap-4 border-b border-white/[0.04] py-3 last:border-0">
            <span className="text-gray-600 dark:text-gray-500 text-sm min-w-[130px]">{label}:</span>
            {isPrivate && !isUnlocked ? (
                <span className="text-gray-500 dark:text-white/20 text-sm blur-[4px] select-none font-mono tracking-widest">
                    Hidden Data
                </span>
            ) : (
                <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {value || "N/A"}
                </span>
            )}
        </div>
    );

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
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">Authentication Required</h3>
                                <p className="text-gray-400 text-sm mb-6">Log in or create an account to securely unlock private property details.</p>
                                <div className="flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setShowModal(false)}><button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl transition-colors">Log In</button></Link>
                                    <Link href="/signup" onClick={() => setShowModal(false)}><button className="w-full bg-black/5 hover:bg-black/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-black dark:text-white border border-black/10 dark:border-white/10 font-semibold py-2.5 rounded-xl transition-colors">Sign Up</button></Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pt-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${userBalance >= UNLOCK_COST ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {userBalance >= UNLOCK_COST ? <Unlock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">Unlock Property</h3>
                                <p className="text-gray-400 text-sm mb-4">Access the detailed address and direct contact numbers for this owner.</p>

                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-4 text-sm">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                                        <span className="text-gray-400">Unlock Cost</span><span className="text-white font-semibold">{UNLOCK_COST} Points</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Your Balance</span><span className={`font-semibold ${userBalance >= UNLOCK_COST ? 'text-[#3B82F6]' : 'text-amber-500'}`}>{userBalance} Points</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mb-6"><CheckCircle2 className="w-3.5 h-3.5" /> Access remains active for 2 months.</p>

                                {userBalance >= UNLOCK_COST ? (
                                    <button onClick={handleConfirmUnlock} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                                        {isLoading ? "Processing..." : "Confirm & Unlock"}
                                    </button>
                                ) : (
                                    <Link href="/pricing" onClick={() => setShowModal(false)}>
                                        <button className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold py-3 rounded-xl transition-colors"><Wallet className="w-4 h-4" /> Top up Wallet to Unlock</button>
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
        <div className="bg-[#111111] border border-white/[0.07] rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <h2 className="font-heading text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3B82F6]" /> Location & Contact Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* COLUMN 1: Detailed Address */}
                <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> Detailed Address
                    </h3>
                    <InfoRow label="City / District" value={zone?.city as string} />
                    <InfoRow label="Thana / Upazila" value={zone?.thana as string} />
                    <InfoRow label="Area" value={zone?.area as string} />

                    <InfoRow label="Road" value={contactData?.road} isPrivate={true} />
                    <InfoRow label="House / Flat" value={contactData?.house} isPrivate={true} />
                    <InfoRow label="Block / Sector" value={contactData?.block} isPrivate={true} />
                    <InfoRow label="Landmark" value={contactData?.landmark} isPrivate={true} />
                    <InfoRow label="Additional Line" value={contactData?.additionalLine} isPrivate={true} />
                </div>

                {/* COLUMN 2: Owner Information */}
                <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                        <User className="w-4 h-4 text-gray-400" /> Owner Details
                    </h3>
                    <InfoRow label="Owner Name" value={contactData?.ownerName} isPrivate={true} />
                    <InfoRow label="Phone Number" value={contactData?.phone} isPrivate={true} />
                    <InfoRow label="WhatsApp" value={contactData?.whatsapp} isPrivate={true} />

                    {!isUnlocked && (
                        <div className="mt-6 p-4 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/20">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-300 mb-3">To protect the owner's privacy, exact location and contact numbers are hidden.</p>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="w-full flex items-center justify-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-[0_0_14px_rgba(59,130,246,0.35)]"
                                    >
                                        <Shield className="w-4 h-4" /> Unlock Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isMounted && createPortal(modalContent, document.body)}
        </div>
    );
}
