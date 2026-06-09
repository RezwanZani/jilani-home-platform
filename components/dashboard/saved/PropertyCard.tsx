'use client';

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
    MapPin, Star, Bookmark, ShieldCheck, Calendar,
    Building2, Users, Mail, Trash2,
    ShieldX,
    HousePlus,
    ArrowRight,
    X,
    AlertTriangle,
    RulerIcon,
    Banknote
} from "lucide-react";
import { SavedProperty } from "./SavedPropertyList";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

// Define the expected props for the Card component
interface PropertyCardProps {
    property: SavedProperty;
    index: number;
    remove: (id: string) => void;
}

export function PropertyCard({ property, index, remove }: PropertyCardProps) {
    const defaultPlaceholder = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";
    const [activeImage, setActiveImage] = useState<string>(property.data.images[0] || property.data.coverImage || defaultPlaceholder);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            layout
            className="w-full"
        >
            <GlassCard className="p-0 bg-white dark:bg-[#0B1121] border-gray-100 dark:border-white/5 shadow-xl rounded-[1.5rem] w-full group hover:border-blue-500/20 transition-all duration-300">
                <div className="flex h-full flex-col gap-6 p-5 xl:flex-row xl:items-stretch">

                    {/* Left: Gallery Section */}
                    <div className="w-full xl:w-[360px] 2xl:w-[400px] flex-shrink-0 space-y-2">
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/5">
                            <ImageWithFallback
                                src={activeImage || defaultPlaceholder}
                                alt={property.data.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                                <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                <p className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{property.data.type}</p>
                            </div>
                            <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                <Bookmark className="w-3 h-3 text-blue-600 fill-blue-600" />
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">SAVED</p>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-2">
                            {/* Because 'property' is typed, TS knows thumb is a string and idx is a number */}
                            {property.data.images.map((image, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImage(image)}
                                    className={cn(
                                        "aspect-[4/3] rounded-md overflow-hidden border transition-all cursor-pointer focus:outline-none",
                                        activeImage === image ? "border-blue-500 ring-2 ring-blue-500/50" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <ImageWithFallback src={image || defaultPlaceholder} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-sm shadow-sm">
                                    {property.data.status === "active" ? (
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-green-500" />
                                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">VERIFIED</span>
                                        </div>
                                    ) : property.data.status === "pending" ? (
                                        <div className="flex items-center gap-1">
                                            <ShieldX className="w-3 h-3 text-yellow-500" />
                                            <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">PENDING</span>
                                        </div>
                                    ) : property.data.status === "inactive" ? (
                                        <div className="flex items-center gap-1">
                                            <ShieldX className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">INACTIVE</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <ShieldX className="w-3 h-3 text-red-500" />
                                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">EXPIRED</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white border border-blue-500/20">
                                    <span className="text-[9px] font-black uppercase tracking-widest">SAVED</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-500 transition-colors">
                                {property.data.title}
                            </h3>

                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-[13px] mb-4">
                                <MapPin className="w-4 h-4 text-blue-500/60" />
                                {property.zone?.name || "Unknown Zone"} <span className="text-[9px] font-black text-gray-500/60 tracking-widest">{`(${property.zone?.area || 'N/A'}, ${property.zone?.thana || 'N/A'}, ${property.zone?.city || 'N/A'})`}</span>
                            </div>

                            <p className="max-w-3xl text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6 opacity-80">
                                {property.data.description}
                            </p>

                            <div className="flex flex-col sm:flex-row justify-between gap-4 border-y border-gray-100 dark:border-white/5 py-5 sm:w-full xl:max-w-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5">
                                        <HousePlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{property.data.roomCount}</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">ROOMS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5">
                                        <RulerIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{property.data.sizeSqft} Sqft</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">SIZE {`(sq ft)`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{property.data.averageRating}</p>
                                            <span className="text-[9px] font-bold text-gray-500">({property.data.totalReviews} REVIEWS)</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">RATING</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">SAVED ON</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{property.savedAt?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || "Unknown"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center">
                                    <Banknote className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Price {property.data.priceType !== 'one-time' && (' / ' + property.data.priceType)}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{'৳ ' + (property.data.price ?? "Unknown")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => window.location.href = `/listings/${property.data.slug}`}
                                    className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-gray-900 dark:bg-[#1E293B] hover:bg-blue-600 dark:hover:bg-blue-600 border border-transparent dark:border-white/10 flex items-center justify-center gap-2 transition-all group/btn"
                                >
                                    <ArrowRight className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-xs font-bold text-gray-100 dark:text-gray-100 uppercase tracking-widest">View Details</span>
                                </button>
                                {/* The Stunning Delete Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    aria-label={`Remove ${property.data.title}`}
                                    className="relative w-12 h-12 rounded-xl bg-white dark:bg-gradient-to-br from-[#1E293B] to-[#0F172A] hover:bg-red-50 dark:hover:from-red-500/20 dark:hover:to-red-600/20 border border-gray-200 dark:border-white/10 hover:border-red-500/50 flex flex-shrink-0 items-center justify-center transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 shadow-sm dark:shadow-lg hover:shadow-red-500/20 group/delete overflow-hidden"
                                >
                                    {/* Inner glowing effect on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover/delete:opacity-100 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0%,transparent_70%)] transition-opacity duration-300" />
                                    <Trash2 className="w-5 h-5 relative z-10" />
                                </motion.button>

                                {/* The Confirmation Modal */}
                                <AnimatePresence>
                                    {isDeleteModalOpen && (
                                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                                            {/* Blurred Overlay */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-md"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                            />

                                            {/* Modal Card */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                className="relative w-full max-w-sm bg-white dark:bg-[#0B1121] border border-gray-200 dark:border-white/10 shadow-2xl rounded-[1.5rem] overflow-hidden"
                                            >
                                                {/* Decorative Top Gradient */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-50" />

                                                <div className="p-6 sm:p-8">
                                                    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                                                        <AlertTriangle className="w-8 h-8 text-red-500" />
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                                                        Remove Property?
                                                    </h3>

                                                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8 leading-relaxed">
                                                        Are you sure you want to remove <span className="text-gray-900 dark:text-white font-semibold">"{property.data.title}"</span> from your saved list? This action cannot be undone.
                                                    </p>

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setIsDeleteModalOpen(false)}
                                                            className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1E293B] dark:hover:bg-[#2A3B52] border border-transparent dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsDeleteModalOpen(false);
                                                                remove(property.data.id);
                                                            }}
                                                            className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 border border-transparent dark:border-red-400/50 text-white font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Top Right Close Button */}
                                                <button
                                                    onClick={() => setIsDeleteModalOpen(false)}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
