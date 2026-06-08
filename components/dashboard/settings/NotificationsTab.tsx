'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function NotificationsTab() {
  return (
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
  );
}

