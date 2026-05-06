'use client';
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowRight, Building2, Heart, MapPin, Star } from "lucide-react";

const OFFICE_IMG = "https://images.unsplash.com/photo-1640109390671-edce15340659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwb2ZmaWNlJTIwc3BhY2UlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3Nzc3MzE4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const HALL_IMG = "https://images.unsplash.com/photo-1763231575952-98244918f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMGhhbGwlMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc3NzMxODczfDA&ixlib=rb-4.1.0&q=80&w=1080";

const RECENT = [
  { id: 1, title: "The Glass House Office", location: "Downtown Metropolis", price: "à§³2,400/mo", rating: 4.9, image: OFFICE_IMG, type: "Office Space" },
  { id: 2, title: "Skyline Event Hall", location: "Westside District", price: "à§³850/day", rating: 4.8, image: HALL_IMG, type: "Event Hall" },
];

export function RecentlyViewed() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
        <Link href="/userdashboard/explore" className="group text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
          Explore more properties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {RECENT.map((property, i) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <GlassCard hoverable className="p-0 overflow-hidden group bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex h-full flex-col">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-white shadow-lg backdrop-blur-md border border-white/10">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{property.type}</p>
                  </div>
                  <button
                    aria-label={`Save ${property.title}`}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold text-white">{property.title}</h3>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{property.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-slate-950 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black">{property.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Starting from</p>
                    <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{property.price}</p>
                  </div>
                  <Link
                    href={`/listings/${property.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                  >
                    Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

