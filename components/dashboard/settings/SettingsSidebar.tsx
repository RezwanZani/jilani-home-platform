'use client';
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Bell, CreditCard, Lock, User, ChevronRight } from "lucide-react";

export type Section = "profile" | "security" | "notifications" | "billing";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile Info", icon: User },
  { id: "security", label: "Password & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plans", icon: CreditCard },
];

interface SettingsSidebarProps {
  active: Section;
  setActive: (section: Section) => void;
}

export function SettingsSidebar({ active, setActive }: SettingsSidebarProps) {
  return (
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
  );
}

