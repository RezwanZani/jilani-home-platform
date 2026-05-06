'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Camera, Check, Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileHeader } from "@/components/dashboard/settings/ProfileHeader";

const AVATAR = "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=256&h=256&q=80";

export function ProfileTab({ user }: { user: any }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">
      <GlassCard className="min-w-0 p-6 sm:p-8 space-y-10 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50 dark:border-white/5">
          <ProfileHeader user={user} />
        </div>

        {/* Form Grid */}
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {[
            { label: "First Name", value: user?.name?.split(" ")[0] || "", icon: User },
            { label: "Last Name", value: user?.name?.split(" ")[1] || "", icon: User },
            { label: "Email Address", value: user?.email || "", icon: Mail, disabled: true },
            { label: "Phone Number", value: user?.phoneNumber || "", icon: Phone, disabled: true },
          ].map((field) => (
            <div key={field.label} className="min-w-0 space-y-2.5">
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                {field.label}
              </label>
              <div className="relative group">
                <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  defaultValue={field.value}
                  disabled={field.disabled}
                  className={cn(
                    "w-full min-w-0 truncate pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400",
                    field.disabled && "opacity-50 cursor-not-allowed"
                  )}
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
  );
}

