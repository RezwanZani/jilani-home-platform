'use client';
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trash2 } from "lucide-react";

export function BillingTab() {
  return (
    <motion.div key="billing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-8">
      <GlassCard className="min-w-0 p-6 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">Current Membership</p>
          <h3 className="text-4xl font-bold mt-2">Premium Plan</h3>
          <p className="text-slate-400 mt-4 text-base font-medium max-w-md">Your account is fully verified. You have unlimited access to direct owner contacts, priority support, and verified property insights.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all">Manage Billing</button>
            <button className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all">Download Invoices</button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="min-w-0 p-6 sm:p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-8 flex items-center gap-3">
          <Trash2 className="w-5 h-5 text-red-500" />
          Danger Zone
        </h4>
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20">
          <p className="text-sm font-bold text-red-900 dark:text-red-300">Delete Account Permanently</p>
          <p className="text-xs text-red-700 dark:text-red-400/70 mt-1 font-medium leading-relaxed">Once deleted, all your saved listings, messages, and account history will be removed from our servers. This action is not reversible.</p>
          <button className="mt-6 px-6 py-3 rounded-xl bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95">Delete My Account</button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

