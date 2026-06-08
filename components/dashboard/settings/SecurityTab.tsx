'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PasswordUpdateForm from "./PasswordUpdateForm";
import PhoneUpdateForm from "./PhoneUpdateForm";
import EmailUpdateForm from "./EmailUpdateForm";

export function SecurityTab() {

  return (
    <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">

      <EmailUpdateForm />

      <PhoneUpdateForm />

      <PasswordUpdateForm />

      {/* <GlassCard className="min-w-0 p-6 sm:p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all">Enable 2FA</button>
        </div>
      </GlassCard> */}
    </motion.div>
  );
}

