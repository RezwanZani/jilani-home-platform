'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ChevronRight, Star, MapPin, Users } from 'lucide-react';
import { Listing } from '@/types/listings'; // Import your types

export default function SimilarListings({ similar }: { similar: Listing[] }) {
    if (!similar || similar.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-14"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-bold text-white">Similar Spaces</h2>
                <Link href="/listings" className="text-[#3B82F6] text-sm hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {similar.map(s => (
                    <Link key={s.id} href={`/listings/${s.id}`} className="group block">
                        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#3B82F6]/30 transition-all duration-300">
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-md rounded-lg px-2 py-1">
                                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                                    <span className="text-white text-xs font-semibold">{s.rating}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-heading text-white font-semibold text-sm group-hover:text-[#3B82F6] transition-colors leading-snug truncate">
                                    {s.title}
                                </h3>
                                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1 truncate">
                                    <MapPin className="w-3 h-3 shrink-0" />{s.area}, {s.city}
                                </p>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                                    <span className="text-white text-sm font-semibold font-heading">{s.price}</span>
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                        <Users className="w-3 h-3" />{s.capacity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}
