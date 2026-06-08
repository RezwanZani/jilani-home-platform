'use client';

import { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner'; // OR: import toast from 'react-hot-toast';
import { toggleSaveProperty } from '@/lib/actions/save-actions';

type SaveButtonProps = {
    propertyId: string;
    initialSavedState?: boolean;
    styleType?: 'card' | 'detail'; // To style it differently for grid cards vs detail page
};

export default function SaveButton({ propertyId, initialSavedState = false, styleType = 'detail' }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialSavedState);
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent triggering parent Link tags if used inside a card
        e.stopPropagation();

        setIsLoading(true);
        try {
            const result = await toggleSaveProperty(propertyId);

            if (!result?.success) {
                if (result?.error === "UNAUTHORIZED") {
                    setShowAuthModal(true); // Trigger the popup!
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } else {
                // Success! Update local state and show toast
                setIsSaved(result.isSaved ?? false);
                if (result.isSaved) {
                    toast.success(result.message);
                } else {
                    toast.info(result.message);
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Styling based on where the button is used
    const buttonStyles = styleType === 'detail'
        ? `flex items-center gap-1.5 bg-[#141414] border text-sm px-4 py-2 rounded-xl transition-all ${isSaved ? 'border-red-500/40 text-red-400' : 'border-white/[0.08] text-gray-300 hover:text-white hover:border-white/20'
        }`
        : `p-2 rounded-full backdrop-blur-md transition-all ${isSaved ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white hover:bg-black/60'
        }`;

    return (
        <>
            {/* THE BUTTON */}
            <button
                onClick={handleSave}
                disabled={isLoading}
                className={`${buttonStyles} disabled:opacity-50`}
            >
                <Heart className={`${styleType === 'detail' ? 'w-4 h-4' : 'w-5 h-5'} ${isSaved ? 'fill-current' : ''} transition-all ${isLoading ? 'animate-pulse' : ''}`} />
                {styleType === 'detail' && (isSaved ? 'Saved' : 'Save')}
            </button>

            {/* THE AUTH POPUP MODAL */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowAuthModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#111111] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center z-10"
                        >
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-heading">Save your favorites</h3>
                            <p className="text-gray-400 text-sm mb-6">Create an account or log in to save this property and view it later on any device.</p>

                            <div className="flex flex-col gap-3">
                                <Link href="/login" onClick={() => setShowAuthModal(false)}>
                                    <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl transition-colors">
                                        Log In
                                    </button>
                                </Link>
                                <Link href="/signup" onClick={() => setShowAuthModal(false)}>
                                    <button className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors">
                                        Create an Account
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
