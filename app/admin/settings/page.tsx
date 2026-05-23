'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Check,
  ChevronRight,
  ShieldAlert,
  Server,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "general" | "notifications" | "security" | "appearance";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Platform Info", icon: Globe },
  { id: "notifications", label: "Alert Config", icon: Bell },
  { id: "security", label: "System Security", icon: Shield },
  { id: "appearance", label: "Design System", icon: Palette },
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

export default function AdminSettingsPage() {
  const [active, setActive] = useState<Section>("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <p className="text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase">Configuration</p>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Platform Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage global platform identity, security, and appearance tokens.</p>
      </motion.div>

      {/* Integrated Settings Container */}
      <GlassCard className="p-0 bg-white/50 dark:bg-[#111827]/80 backdrop-blur-xl border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem]">
        <div className="flex flex-col lg:flex-row min-h-[700px]">
          
          {/* Connected Sidebar Nav */}
          <div className="w-full lg:w-72 bg-gray-50/50 dark:bg-black/20 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 p-8 flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 ml-4">Settings Menu</p>
            <nav className="space-y-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                    active === s.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-4">
                    <s.icon className={cn("w-5 h-5", active === s.id ? "text-white" : "text-gray-400 group-hover:text-blue-500")} />
                    {s.label}
                  </span>
                  {active === s.id && (
                    <motion.div layoutId="activeInd" className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Connected Content Area */}
          <div className="flex-1 p-10 lg:p-12 overflow-y-auto">
            <AnimatePresence mode="wait">
              {active === "general" && (
                <motion.div 
                  key="general" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                         <Globe className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-2xl">Platform Identity</h3>
                         <p className="text-sm text-gray-500 font-medium mt-0.5">Core branding and contact information.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {[
                        { label: "Platform Name", value: "Jilani Home" },
                        { label: "Support Email", value: "support@jilanihome.com" },
                        { label: "Platform URL", value: "https://jilanihome.com" },
                        { label: "Admin Email", value: "admin@jilanihome.com" },
                      ].map((f) => (
                        <div key={f.label} className="space-y-3">
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{f.label}</label>
                          <input defaultValue={f.value} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-[15px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                         <Database className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-2xl">Listing Rules</h3>
                         <p className="text-sm text-gray-500 font-medium mt-0.5">Define platform-wide constraints for property listings.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {[
                        { label: "Max Photos / Listing", value: "20" },
                        { label: "Commission Rate (%)", value: "5.0" },
                        { label: "Verification Required", value: "Yes" },
                        { label: "Listing Expiry (Days)", value: "90" },
                      ].map((f) => (
                        <div key={f.label} className="space-y-3">
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{f.label}</label>
                          <input defaultValue={f.value} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-[15px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button 
                      onClick={handleSave} 
                      className={cn(
                        "flex items-center gap-3 px-12 py-4 rounded-2xl text-sm font-bold transition-all shadow-2xl active:scale-95", 
                        saved ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700"
                      )}
                    >
                      {saved ? <><Check className="w-5 h-5" /> Saved Successfully</> : "Apply Global Changes"}
                    </button>
                  </div>
                </motion.div>
              )}

              {active === "notifications" && (
                <motion.div 
                  key="notifications" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                   <div className="flex items-center justify-between">
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-2xl flex items-center gap-4">
                            <Bell className="w-8 h-8 text-blue-600" />
                            Admin Alerts Config
                         </h3>
                         <p className="text-sm text-gray-500 font-medium mt-1">Configure system notifications for platform events.</p>
                      </div>
                      <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">Test Alarms</button>
                   </div>
                   <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
                    {[
                      { label: "New Host Registrations", desc: "Send immediate email alert when a new host submits their profile for review", defaultChecked: true },
                      { label: "Platform Downtime", desc: "Critical alerts if server response times exceed 2000ms for more than 5 minutes", defaultChecked: true },
                      { label: "Failed Payment Transactions", desc: "Notify billing team when a user payment fails after 3 attempts", defaultChecked: true },
                      { label: "Weekly Growth Digest", desc: "Consolidated report of platform metrics sent every Monday at 8:00 AM", defaultChecked: true },
                      { label: "Listing Violation Reports", desc: "Alert when a listing receives more than 5 reports in 24 hours", defaultChecked: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-8 hover:bg-white dark:hover:bg-white/[0.03] transition-colors">
                        <div className="space-y-1">
                          <p className="text-base font-bold text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">{item.desc}</p>
                        </div>
                        <Toggle defaultChecked={item.defaultChecked} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {active === "security" && (
                <motion.div 
                  key="security" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                   <div className="space-y-10">
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-2xl flex items-center gap-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                            Platform Hardening
                         </h3>
                         <p className="text-sm text-gray-500 font-medium mt-1">Strengthen the administrative portal security layer.</p>
                      </div>
                      <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
                        {[
                          { label: "Admin Two-Factor Auth", desc: "Mandatory 2FA requirement for all users with access to the admin dashboard", defaultChecked: true },
                          { label: "IP Restriction (Whitelist)", desc: "Only allow access to the admin portal from authorized company IP addresses", defaultChecked: false },
                          { label: "Granular Audit Logs", desc: "Record every single data change action performed by administrators", defaultChecked: true },
                          { label: "Auto Session Termination", desc: "Force sign-out admin sessions after 45 minutes of inactivity", defaultChecked: true },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-8 hover:bg-white dark:hover:bg-white/[0.03] transition-colors">
                            <div className="space-y-1">
                              <p className="text-base font-bold text-gray-900 dark:text-white">{item.label}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">{item.desc}</p>
                            </div>
                            <Toggle defaultChecked={item.defaultChecked} />
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="p-10 rounded-[2rem] bg-red-500/5 border border-red-500/20 flex items-start gap-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                         <ShieldAlert className="w-8 h-8 text-red-500" />
                      </div>
                      <div className="relative z-10">
                         <h4 className="text-xl font-bold text-red-600 dark:text-red-400">System Maintenance Mode</h4>
                         <p className="text-sm text-red-700 dark:text-red-400/80 font-medium mt-2 leading-relaxed max-w-2xl">
                           Enabling maintenance mode will disconnect all active users and show a "Site Under Maintenance" page globally. Only authorized admin IPs will be able to access the site.
                         </p>
                         <button className="mt-8 px-8 py-3.5 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">Enable Maintenance Mode</button>
                      </div>
                   </div>
                </motion.div>
              )}

              {active === "appearance" && (
                <motion.div 
                  key="appearance" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-10">
                    <div>
                       <h3 className="font-bold text-gray-900 dark:text-white text-2xl flex items-center gap-4">
                          <Palette className="w-8 h-8 text-blue-600" />
                          Brand Assets
                       </h3>
                       <p className="text-sm text-gray-500 font-medium mt-1">Manage global theme tokens and visual design system.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {[
                        { label: "Primary Blue", color: "#3B82F6" },
                        { label: "Dark Background", color: "#0F172A" },
                        { label: "Accent Indigo", color: "#6366F1" },
                      ].map((c) => (
                        <div key={c.label} className="group">
                           <div className="h-32 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-inner transition-transform group-hover:scale-[1.02] duration-500" style={{ backgroundColor: c.color }} />
                           <div className="mt-4 text-center">
                              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{c.label}</p>
                              <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-tighter opacity-60">{c.color}</p>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                      <div className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 space-y-5 hover:border-blue-500/20 transition-all group">
                         <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Server className="w-7 h-7 text-blue-500" />
                         </div>
                         <h4 className="text-lg font-bold text-gray-900 dark:text-white">API Endpoints</h4>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Configure the base URL for the platform's backend services and storage buckets.</p>
                         <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2">Edit Configuration <ChevronRight className="w-4 h-4" /></button>
                      </div>
                      <div className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 space-y-5 hover:border-emerald-500/20 transition-all group">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Code className="w-7 h-7 text-emerald-500" />
                         </div>
                         <h4 className="text-lg font-bold text-gray-900 dark:text-white">Webhook Integration</h4>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Send real-time platform events to external services like Slack or Zapier.</p>
                         <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2">Setup Webhooks <ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
