'use client';

import { useUser } from "@/components/providers/UserProvider";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, SettingsSidebar } from "@/components/dashboard/settings/SettingsSidebar";
import { ProfileTab } from "@/components/dashboard/settings/ProfileTab";
import { SecurityTab } from "@/components/dashboard/settings/SecurityTab";
import { NotificationsTab } from "@/components/dashboard/settings/NotificationsTab";
import { BillingTab } from "@/components/dashboard/settings/BillingTab";

export default function UserSettingsPage() {
  const user = useUser();
  const [active, setActive] = useState<Section>("profile");

  return (
    <div className="w-full min-w-0 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Account Preferences</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">Manage your personal information, security, and alerts.</p>
      </motion.div>

      <div className="grid min-w-0 grid-cols-1 gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SettingsSidebar active={active} setActive={setActive} />

        {/* Content Area */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {active === "profile" && <ProfileTab user={user} />}
            {active === "security" && <SecurityTab />}
            {active === "notifications" && <NotificationsTab />}
            {active === "billing" && <BillingTab />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
