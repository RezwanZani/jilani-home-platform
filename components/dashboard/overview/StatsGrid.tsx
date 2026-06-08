'use client';
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Coins, Key, Bookmark, MessageSquare, ArrowRight, AlertTriangle } from "lucide-react";

export function StatsGrid({ stats }: { stats: any }) {
  const isLowBalance = stats.pointsBalance < 50;

  const metrics = [
    { label: "Active Unlocks", value: `${stats.activeUnlocksCount} Properties`, icon: Key, color: "text-emerald-500" },
    { label: "Saved Properties", value: `${stats.savedSpacesCount} Spaces`, icon: Bookmark, color: "text-blue-500" },
    { label: "Inquiries Made", value: `${stats.inquiriesCount} Requests`, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Wallet Balance Card - Special Styling */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="h-full"
      >
        <div 
          className={cn(
            "relative p-6 rounded-2xl h-full flex flex-col justify-between overflow-hidden transition-all duration-300 group",
            isLowBalance 
              ? "bg-white dark:bg-slate-800 border border-amber-500/30 shadow-sm hover:shadow-md" 
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-500/40"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-50" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isLowBalance ? "bg-amber-500/10" : "bg-blue-500/10 dark:bg-blue-500/20")}>
                <Coins className={cn("w-5 h-5", isLowBalance ? "text-amber-500" : "text-blue-600 dark:text-blue-500")} />
              </div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", isLowBalance ? "text-amber-600 dark:text-amber-500/70" : "text-blue-600/70 dark:text-blue-400/70")}>
                Wallet
              </p>
            </div>
            
            <div>
              <h3 className={cn("text-3xl font-bold mb-1 tracking-tight", isLowBalance ? "text-amber-600 dark:text-amber-500" : "text-gray-900 dark:text-white")}>
                {stats.pointsBalance} <span className="text-sm text-gray-500 font-medium">pts</span>
              </h3>
              
              {isLowBalance ? (
                <p className="text-xs font-bold text-amber-600 dark:text-amber-500/80 flex items-center gap-1.5 mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Balance low — cannot unlock
                </p>
              ) : (
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 mt-2 transition-colors group-hover:gap-2">
                  Top Up Wallet <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Standard Metric Cards */}
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (i + 1) * 0.1 }}
          className="h-full"
        >
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-blue-500/30 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.03] flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/[0.06] transition-colors">
                <m.icon className={cn("w-5 h-5", m.color)} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {m.label}
              </p>
            </div>
            <div>
              <h3 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-50 transition-colors">{m.value}</h3>
              {m.label === "Active Unlocks" && (
                <button className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mt-2 transition-colors">
                  View All Active <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
