'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, Shield, CheckCircle2, KeyRound, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function SecurityTab() {
  const [emailStep, setEmailStep] = useState<"form" | "otp" | "success">("form");
  const [phoneStep, setPhoneStep] = useState<"form" | "otp" | "success">("form");
  const [passwordStep, setPasswordStep] = useState<"form" | "otp" | "success">("form");

  return (
    <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">
      
      {/* Email Change Section */}
      <GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Email Address</h3>
        </div>
        
        <AnimatePresence mode="wait">
          {emailStep === "form" && (
            <motion.div key="email-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">New Email Address</label>
                <input type="email" placeholder="new.email@example.com" className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <button 
                onClick={() => setEmailStep("otp")}
                className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
              >
                Send Verification Code
              </button>
            </motion.div>
          )}

          {emailStep === "otp" && (
            <motion.div key="email-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-medium">
                We've sent a 6-digit verification code to your new email address. Please enter it below.
              </div>
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Code</label>
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <input key={i} type="text" maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-blue-500/50 transition-all" />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setEmailStep("success")}
                  className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Verify & Update Email
                </button>
                <button 
                  onClick={() => setEmailStep("form")}
                  className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {emailStep === "success" && (
            <motion.div key="email-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl max-w-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Email Successfully Updated</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Your account email has been verified and updated.</p>
              <button 
                onClick={() => setEmailStep("form")}
                className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Phone Change Section */}
      <GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Phone Number</h3>
        </div>
        
        <AnimatePresence mode="wait">
          {phoneStep === "form" && (
            <motion.div key="phone-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">New Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-white/10 text-gray-500 text-sm font-bold">
                    +880
                  </span>
                  <input type="tel" placeholder="1XXXXXXXXX" className="w-full px-5 py-3.5 rounded-r-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <button 
                onClick={() => setPhoneStep("otp")}
                className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
              >
                Send Verification Code
              </button>
            </motion.div>
          )}

          {phoneStep === "otp" && (
            <motion.div key="phone-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-medium">
                We've sent a 6-digit verification code via SMS to your new phone number.
              </div>
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Code</label>
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <input key={i} type="text" maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-blue-500/50 transition-all" />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setPhoneStep("success")}
                  className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Verify & Update Number
                </button>
                <button 
                  onClick={() => setPhoneStep("form")}
                  className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {phoneStep === "success" && (
            <motion.div key="phone-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl max-w-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Phone Number Successfully Updated</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Your account phone number has been verified and updated.</p>
              <button 
                onClick={() => setPhoneStep("form")}
                className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Password Change Section */}
      <GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Password</h3>
        </div>

        <AnimatePresence mode="wait">
          {passwordStep === "form" && (
            <motion.div key="password-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                <div key={label} className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
                  <input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                </div>
              ))}
              <button 
                onClick={() => setPasswordStep("otp")}
                className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
              >
                Update Password
              </button>
            </motion.div>
          )}

          {passwordStep === "otp" && (
            <motion.div key="password-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-medium">
                For your security, please verify this change by entering the code sent to your email.
              </div>
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Code</label>
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <input key={i} type="text" maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-blue-500/50 transition-all" />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setPasswordStep("success")}
                  className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Verify & Save Password
                </button>
                <button 
                  onClick={() => setPasswordStep("form")}
                  className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {passwordStep === "success" && (
            <motion.div key="password-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl max-w-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Password Successfully Updated</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Your new password is now active. You can use it for your next login.</p>
              <button 
                onClick={() => setPasswordStep("form")}
                className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <GlassCard className="min-w-0 p-6 sm:p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
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
      </GlassCard>
    </motion.div>
  );
}

