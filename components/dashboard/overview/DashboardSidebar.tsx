'use client';
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowRight, Calendar, ShieldCheck, Star } from "lucide-react";

const OFFICE_IMG = "https://images.unsplash.com/photo-1640109390671-edce15340659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwb2ZmaWNlJTIwc3BhY2UlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3Nzc3MzE4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const HALL_IMG = "https://images.unsplash.com/photo-1763231575952-98244918f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMGhhbGwlMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc3NzMxODczfDA&ixlib=rb-4.1.0&q=80&w=1080";

const RECOMMENDED = [
  { id: 3, title: "Crystal Ballroom", loc: "Grand Central", price: "à§³1,200/day", type: "Event Hall", image: HALL_IMG },
  { id: 4, title: "Nova Co-Working", loc: "Innovation Qtr", price: "à§³350/mo", type: "Office", image: OFFICE_IMG },
];

export function DashboardSidebar() {
  return (
    <div className="space-y-8">
      {/* Premium Status Card */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden shadow-2xl group border border-white/5">
        {/* Abstract Shapes */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Account Status</p>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Premium Member</h2>
          <p className="text-slate-400 mt-3 text-sm leading-relaxed font-medium">
            You have full access to verified owner contacts and premium listing insights.
          </p>
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member since Jan 2026</p>
          </div>
        </div>
      </div>

      <GlassCard className="p-6 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </span>
            Recommended
          </h3>
          <Link href="/userdashboard/explore" className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {RECOMMENDED.map((rec) => (
            <Link
              key={rec.id}
              href={`/listings/${rec.id}`}
              className="group grid grid-cols-[86px_minmax(0,1fr)] gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-2.5 transition-all hover:border-blue-500/30 hover:bg-blue-50/60 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <div className="relative h-20 overflow-hidden rounded-xl">
                <img src={rec.image} alt={rec.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="mb-1 inline-flex rounded-md bg-blue-600/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {rec.type}
                  </span>
                  <h4 className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">{rec.title}</h4>
                  <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {rec.loc} / {rec.price}
                  </p>
                </div>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-8 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Viewings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
          You don't have any property viewings scheduled for this week.
        </p>
        <button className="w-full mt-6 py-3 rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-colors">
          Schedule Now
        </button>
      </GlassCard>
    </div>
  );
}

