'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, Info, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { submitReview, getPropertyReviews } from '@/lib/actions/review-actions';

type ReviewSectionProps = {
    propertyId: string;
    averageRating: number;
    totalReviews: number;
    isLoggedIn: boolean;
    hasUnlocked: boolean;
};

export default function ReviewSection({ propertyId, averageRating, totalReviews, isLoggedIn, hasUnlocked }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
    const [isLoading, setIsLoading] = useState(true);

    // Form Toggle State
    const [isWritingReview, setIsWritingReview] = useState(false);

    // Form Data State
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [reviewMessage, setReviewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = async () => {
        setIsLoading(true);
        const res = await getPropertyReviews(propertyId, sortBy);
        if (res.success) {
            setReviews(res.data);
            // Pre-fill form if user already reviewed
            const ownReview = res.data.find((r: any) => r.isOwnReview);
            if (ownReview) {
                setSelectedRating(ownReview.rating);
                setReviewMessage(ownReview.message || '');
            }
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchReviews(); }, [sortBy]);

    const handleSubmit = async () => {
        if (selectedRating === 0) return toast.error("Please select a star rating");
        setIsSubmitting(true);

        const res = await submitReview(propertyId, selectedRating, reviewMessage);
        if (res.success) {
            toast.success(res.message);
            setIsWritingReview(false); // Close the form on success
            fetchReviews(); // Refresh list
        } else {
            toast.error("Failed to submit review");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-[#111111] border border-white/[0.07] rounded-3xl p-6 md:p-8 space-y-10">

            {/* ── Header & Stats ── */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                    <h2 className="font-heading text-2xl font-bold text-white mb-1">Ratings & Reviews</h2>
                    <p className="text-gray-400 text-sm">Ratings are calculated instantly.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* The Average Score Box */}
                    <div className="flex items-center gap-4 bg-[#141414] px-5 py-3 rounded-2xl border border-white/[0.05]">
                        <div className="text-center">
                            <span className="text-3xl font-heading font-bold text-white">{averageRating}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-0.5 mb-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(averageRating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-700'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500 block">{totalReviews} reviews</span>
                        </div>
                    </div>

                    {/* Conditional "Write Review" Action Button */}
                    <div>
                        {!isLoggedIn ? (
                            <Link href="/login">
                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all">
                                    Log in to Review
                                </button>
                            </Link>
                        ) : !hasUnlocked ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl cursor-not-allowed" title="Unlock contact details to leave an authentic review.">
                                <Lock className="w-4 h-4 text-gray-500" />
                                Unlock property to review
                            </div>
                        ) : !isWritingReview ? (
                            <button
                                onClick={() => setIsWritingReview(true)}
                                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                            >
                                Write a Review
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsWritingReview(false)}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold px-5 py-3 rounded-xl transition-all"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Slide-Down Review Form ── */}
            <AnimatePresence>
                {isWritingReview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#141414] border border-[#3B82F6]/30 rounded-2xl p-6 relative">
                            <h3 className="text-white font-medium mb-4">Rate your experience with this space</h3>
                            <div className="flex items-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setSelectedRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star className={`w-8 h-8 transition-colors ${(hoveredStar || selectedRating) >= star ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-600'
                                            }`} />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <textarea
                                    value={reviewMessage}
                                    onChange={(e) => setReviewMessage(e.target.value)}
                                    placeholder="Share details of your experience (Optional)"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3B82F6]/50 min-h-[100px] resize-y"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Text requires approval to prevent contact leaks.</p>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || selectedRating === 0}
                                        className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 text-sm font-semibold px-6 py-2.5 rounded-lg transition-all"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Reviews List ── */}
            <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <h3 className="text-white font-medium">User Reviews</h3>
                    <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="bg-transparent text-sm text-gray-400 focus:outline-none cursor-pointer"
                    >
                        <option value="newest" className="bg-[#111111]">Newest first</option>
                        <option value="highest" className="bg-[#111111]">Highest rated</option>
                        <option value="lowest" className="bg-[#111111]">Lowest rated</option>
                        <option value="oldest" className="bg-[#111111]">Oldest first</option>
                    </select>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center py-10 text-[#3B82F6] font-medium text-sm animate-pulse">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                            <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">No reviews yet. Unlock this property to be the first!</p>
                        </div>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} className="flex gap-4 group">
                                <img
                                    src={r.userImage || `https://ui-avatars.com/api/?name=${r.userName}&background=141414&color=fff`}
                                    alt={r.userName}
                                    className="w-10 h-10 rounded-full bg-gray-800 shrink-0 object-cover border border-white/10"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-white text-sm font-medium">
                                            {r.userName}
                                            {r.isOwnReview && <span className="text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-md text-[10px] ml-2 font-semibold tracking-wide uppercase">You</span>}
                                        </h4>
                                        <span className="text-xs text-gray-600">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-800'}`} />
                                        ))}
                                    </div>

                                    {r.message ? (
                                        <p className="text-gray-400 text-sm leading-relaxed">{r.message}</p>
                                    ) : (
                                        <p className="text-gray-600 text-sm italic">Message hidden or pending approval.</p>
                                    )}

                                    {r.isOwnReview && r.status === 'pending' && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-500 bg-amber-500/10 w-fit px-2 py-1.5 rounded-md font-medium">
                                            <Info className="w-3.5 h-3.5" /> Your message is pending admin approval.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
