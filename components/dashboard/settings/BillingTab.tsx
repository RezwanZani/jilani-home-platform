'use client';
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trash2, CreditCard, Download, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
 
interface BillingTabProps {
  user?: any;
}
 
export function BillingTab({ user }: BillingTabProps) {
  const isPremium = user ? (user.pointsBalance > 0) : false;
 
  return (
    <motion.div key="billing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-8">
      {isPremium ? (
        <GlassCard className="min-w-0 p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-white/10 shadow-2xl relative overflow-hidden group rounded-2xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-[0.15em]">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Current Membership
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-black mt-4 bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent tracking-tight">
              Premium Plan
            </h3>
            
            <p className="text-slate-300 mt-4 text-base font-medium max-w-md leading-relaxed">
              Your account is fully verified. You have unlimited access to direct owner contacts, priority support, and verified property insights.
            </p>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-200">Unlimited Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-200">Priority Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-200">Verified Insights</span>
              </div>
            </div>
 
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/dashboard/store" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 !text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-2">
                <CreditCard className="w-4 h-4 !text-white" />
                <span>Manage Billing</span>
              </Link>
              <button className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 backdrop-blur-md !text-white font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-2">
                <Download className="w-4 h-4 !text-white" />
                <span>Download Invoices</span>
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="min-w-0 p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-white/5 shadow-2xl relative overflow-hidden group rounded-2xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-gray-600/10 to-blue-600/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-bold uppercase tracking-[0.15em]">
              Current Membership
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-black mt-4 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
              Free Plan
            </h3>
            
            <p className="text-slate-400 mt-4 text-base font-medium max-w-md leading-relaxed">
              You are currently on the Free Plan. Purchase points to unlock direct owner contact details and view verified property insights.
            </p>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 opacity-60">
                <div className="p-1 bg-red-500/15 text-red-400 rounded-lg">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Direct Contacts Locked</span>
              </div>
              <div className="flex items-center gap-2 opacity-60">
                <div className="p-1 bg-red-500/15 text-red-400 rounded-lg">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Standard Support</span>
              </div>
              <div className="flex items-center gap-2 opacity-60">
                <div className="p-1 bg-red-500/15 text-red-400 rounded-lg">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Limited Insights</span>
              </div>
            </div>
 
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/dashboard/store" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 !text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-2">
                <CreditCard className="w-4 h-4 !text-white" />
                <span>Upgrade to Premium</span>
              </Link>
            </div>
          </div>
        </GlassCard>
      )}
 
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

