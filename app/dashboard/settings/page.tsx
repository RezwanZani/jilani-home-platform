'use client';

import { useUser } from "@/components/providers/UserProvider";
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Camera,
  Check,
  ChevronRight,
  Shield,
  Globe,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR = "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=256&h=256&q=80";

type Section = "profile" | "security" | "notifications" | "billing";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile Info", icon: User },
  { id: "security", label: "Password & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plans", icon: CreditCard },
];

const Toggle = ({ defaultChecked = false }: { defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "w-12 h-6.5 rounded-full border-2 transition-all relative flex-shrink-0",
        on ? "bg-blue-500 border-blue-500" : "bg-gray-200 dark:bg-slate-700 border-gray-200 dark:border-slate-700"
      )}
    >
      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all", on ? "left-[calc(100%-1.375rem)]" : "left-0.5")} />
    </button>
  );
};

export default function UserSettingsPage() {
  const user = useUser();
  const [active, setActive] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full min-w-0 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Account Preferences</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">Manage your personal information, security, and alerts.</p>
      </motion.div>

      <div className="grid min-w-0 grid-cols-1 gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar Nav */}
        <div className="min-w-0">
          <GlassCard className="p-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
            <nav className="space-y-1.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all group",
                    active === s.id
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <s.icon className={cn("w-4.5 h-4.5", active === s.id ? "text-white" : "text-gray-400 group-hover:text-blue-500")} />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <ChevronRight className={cn("w-4 h-4 flex-shrink-0 transition-transform", active === s.id ? "rotate-90" : "opacity-0 group-hover:opacity-100")} />
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content Area */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {active === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">
                <GlassCard className="min-w-0 p-6 sm:p-8 space-y-10 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50 dark:border-white/5">
                    <div className="relative group">
                      <img src={AVATAR} alt="" className="w-28 h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-700 shadow-xl group-hover:opacity-80 transition-opacity" />
                      <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all active:scale-90 border-2 border-white dark:border-slate-800">
                        <Camera className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="min-w-0 text-center sm:text-left space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user?.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Profile photo will be visible to hosts.</p>
                      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 sm:justify-start">
                        <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Upload New</button>
                        <button className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest">Remove</button>
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                    {[
                      { label: "First Name", value: user?.name?.split(" ")[0] || "", icon: User },
                      { label: "Last Name", value: user?.name?.split(" ")[1] || "", icon: User },
                      { label: "Email Address", value: user?.email || "", icon: Mail },
                      { label: "Phone Number", value: user?.phoneNumber || "", icon: Phone },
                    ].map((field) => (
                      <div key={field.label} className="min-w-0 space-y-2.5">
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                          {field.label}
                        </label>
                        <div className="relative group">
                          <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            defaultValue={field.value}
                            className="w-full min-w-0 truncate pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-4">
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Biography</label>
                    <textarea
                      defaultValue="Real estate enthusiast looking for premium spaces in the city center. Interested in modern architecture and eco-friendly designs."
                      rows={4}
                      className="w-full min-w-0 px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed"
                    />
                  </div>
                </GlassCard>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className={cn(
                      "flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-2xl active:scale-95 sm:w-auto sm:px-10",
                      saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-700"
                    )}
                  >
                    {saved ? <><Check className="w-5 h-5" /> All Changes Saved!</> : "Save Profile Information"}
                  </button>
                </div>
              </motion.div>
            )}

            {active === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">
                <GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Password</h3>
                  </div>
                  <div className="space-y-6 max-w-xl">
                    {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                      <div key={label} className="space-y-2.5">
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                      </div>
                    ))}
                    <button className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95">Update Password</button>
                  </div>
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
            )}

            {active === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <GlassCard className="min-w-0 p-0 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 dark:border-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-3">
                      <Bell className="w-6 h-6 text-blue-600" />
                      Email & Push Notifications
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {[
                      { label: "New Listings", desc: "Alert when properties matching your criteria are listed", defaultChecked: true },
                      { label: "Host Messages", desc: "When a host responds to your inquiry or schedules a viewing", defaultChecked: true },
                      { label: "Price Adjustments", desc: "When a saved listing reduces its price significantly", defaultChecked: true },
                      { label: "Viewing Reminders", desc: "Get notified 24h before a scheduled property viewing", defaultChecked: true },
                      { label: "Platform News", desc: "Important news and feature announcements from Jilani Home", defaultChecked: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-6 p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="space-y-1">
                          <p className="text-base font-bold text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md">{item.desc}</p>
                        </div>
                        <Toggle defaultChecked={item.defaultChecked} />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {active === "billing" && (
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
