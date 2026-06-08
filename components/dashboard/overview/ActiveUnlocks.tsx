'use client';
import React from "react";
import { motion } from "framer-motion";
import { Phone, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ActiveUnlocks({ initialSpaces }: { initialSpaces: any[] }) {
  const displaySpaces = initialSpaces.slice(0, 4);
  const hasMore = initialSpaces.length > 4;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Active Unlocked Spaces
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quick access to property owners you've contacted.</p>
        </div>
      </div>

      <div className="space-y-4">
        {displaySpaces.length === 0 ? (
          <p className="text-gray-500 text-sm">No active unlocks found.</p>
        ) : displaySpaces.map((space, i) => {
          const prop = space.data;
          // Calculate days left
          const msLeft = new Date(space.expiresAt).getTime() - new Date().getTime();
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
          const isExpiring = daysLeft <= 7;
          
          return (
            <motion.div
              key={space.unlockedId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img src={prop.images?.[0] || '/placeholder.png'} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/listings/${prop.slug}`}>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors">{prop.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{space.zone?.area || space.zone?.city}</p>
                
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Link href={`/listings/${prop.slug}`} className="flex items-center gap-1.5 bg-white dark:bg-white/[0.05] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">View Contact</span>
                  </Link>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-white/[0.06] pt-4 sm:pt-0 sm:pl-6 sm:w-48">
                <div className="flex flex-col items-start sm:items-end w-full">
                  <span className={cn("text-xs font-bold flex items-center gap-1 mb-2", isExpiring ? "text-amber-500" : "text-emerald-500")}>
                    <Clock className="w-3.5 h-3.5" />
                    {daysLeft > 0 ? `${daysLeft} Days Left` : "Expired"}
                  </span>
                  <div className="w-full bg-gray-200 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", isExpiring ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${Math.max(0, Math.min((daysLeft / 60) * 100, 100))}%` }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {hasMore && (
        <div className="mt-6 text-center border-t border-gray-100 dark:border-white/[0.05] pt-6">
          <Link href="/dashboard/unlocks" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            See More Unlocks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
