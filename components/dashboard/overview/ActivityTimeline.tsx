'use client';
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Bookmark, MessageSquare, ShieldCheck } from "lucide-react";

export function ActivityTimeline() {
  return (
    <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Recent Activity</h2>
      <div className="space-y-8">
        {[
          { time: "2h ago", title: "Inquiry Sent", desc: "You messaged the host of Skyline Event Hall regarding availability for March.", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { time: "Yesterday", title: "Listing Saved", desc: "Lumina Penthouse was added to your 'Dream Homes' collection.", icon: Bookmark, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { time: "3 days ago", title: "Viewing Confirmed", desc: "Your viewing for The Glass House Office is scheduled for Friday at 2:00 PM.", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        ].map((item, i) => (
          <div key={i} className="flex gap-6 relative">
            {i !== 2 && <div className="absolute left-7 top-14 bottom-[-2rem] w-0.5 bg-gray-100 dark:bg-white/5" />}
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm", item.bg)}>
              <item.icon className={cn("w-6 h-6", item.color)} />
            </div>
            <div className="py-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.title}</h4>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{item.time}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed text-sm max-w-lg">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

