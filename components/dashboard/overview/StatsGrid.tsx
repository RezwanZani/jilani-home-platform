'use client';
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Bookmark, MessageSquare, ShieldCheck } from "lucide-react";

const STATS = [
  { label: "Saved Properties", value: "12", icon: Bookmark, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { label: "Active Inquiries", value: "4", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { label: "Verified Viewings", value: "2", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", s.bg)}>
                <s.icon className={cn("w-7 h-7", s.color)} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

