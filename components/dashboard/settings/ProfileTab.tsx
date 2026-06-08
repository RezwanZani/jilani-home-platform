'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Camera, Check, Loader, Loader2, Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileHeader } from "@/components/dashboard/settings/ProfileHeader";
import { updateProfileInfo } from "@/lib/actions/user-actions";

const AVATAR = "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=256&h=256&q=80";

export function ProfileTab({ user }: { user: any }) {
  const [name, setName] = useState(user.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);


    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateProfileInfo(formData);

    if (result.success) {
      setStatusMessage({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    } else {
      setStatusMessage({ type: "error", message: result.error || "Failed to update profile" });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    }

    setIsSaving(false);
  };

  return (
    <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 space-y-6">
      <form onSubmit={handleSave}>
        <GlassCard className="min-w-0 p-6 sm:p-8 space-y-10 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50 dark:border-white/5">
            <ProfileHeader user={user} />
          </div>

          {statusMessage.message && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={cn(
                "p-3 rounded-lg text-center font-medium text-sm",
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {statusMessage.message}
            </motion.div>
          )}

          {/* Form Grid */}
          <div key="Name" className="min-w-0 space-y-2.5">

            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
              Name
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "w-full min-w-0 truncate pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400"
                )}
              />
            </div>

            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                name="email"
                value={user.email || "Email"}
                disabled
                className={cn(
                  "w-full min-w-0 truncate pl-12 pr-4 py-3.5 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400"
                )}
              />
            </div>

            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
              Phone Number
            </label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                name="phoneNumber"
                value={user.phoneNumber || "Phone Number"}
                disabled
                className={cn(
                  "w-full min-w-0 truncate pl-12 pr-4 py-3.5 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400"
                )}
              />
            </div>
          </div>

        </GlassCard>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-2xl active:scale-95 sm:w-auto sm:px-10",
              isSaving ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-700"
            )}
            disabled={isSaving}
          >
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : "Save Profile Information"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

