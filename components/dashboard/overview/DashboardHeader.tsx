'use client';
import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Dashboard Overview</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">Here's a summary of your property activity this week.</p>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5">
        <Calendar className="w-4 h-4" />
        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </motion.div>
  );
}

