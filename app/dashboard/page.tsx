'use client';

import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Bookmark,
  Calendar,
  Building2,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { SessionTester } from '@/components/SessionTester'

const OFFICE_IMG = "https://images.unsplash.com/photo-1640109390671-edce15340659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwb2ZmaWNlJTIwc3BhY2UlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3Nzc3MzE4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const HALL_IMG = "https://images.unsplash.com/photo-1763231575952-98244918f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMGhhbGwlMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc3NzMxODczfDA&ixlib=rb-4.1.0&q=80&w=1080";

const STATS = [
  { label: "Saved Properties", value: "12", icon: Bookmark, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { label: "Active Inquiries", value: "4", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { label: "Verified Viewings", value: "2", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
];

const RECENT = [
  { id: 1, title: "The Glass House Office", location: "Downtown Metropolis", price: "৳2,400/mo", rating: 4.9, image: OFFICE_IMG, type: "Office Space" },
  { id: 2, title: "Skyline Event Hall", location: "Westside District", price: "৳850/day", rating: 4.8, image: HALL_IMG, type: "Event Hall" },
];

const RECOMMENDED = [
  { id: 3, title: "Crystal Ballroom", loc: "Grand Central", price: "৳1,200/day", type: "Event Hall", image: HALL_IMG },
  { id: 4, title: "Nova Co-Working", loc: "Innovation Qtr", price: "৳350/mo", type: "Office", image: OFFICE_IMG },
];

export default function UserDashboardPage({ user }: { user: any }) {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Dashboard Overview</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Here's a summary of your property activity this week.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", s.bg)}>
                  <s.icon className={cn("w-7 h-7", s.color)} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
            <Link href="/userdashboard/explore" className="group text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
              Explore more properties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {RECENT.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <GlassCard hoverable className="p-0 overflow-hidden group bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex h-full flex-col">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-white shadow-lg backdrop-blur-md border border-white/10">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{property.type}</p>
                      </div>
                      <button
                        aria-label={`Save ${property.title}`}
                        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold text-white">{property.title}</h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="truncate">{property.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-slate-950 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-black">{property.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4 p-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Starting from</p>
                        <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{property.price}</p>
                      </div>
                      <Link
                        href={`/listings/${property.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                      >
                        Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Activity Timeline */}
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
        </div>

        {/* Sidebar Widgets */}
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

        {/* DEBUG TOOL (Remove in production) */}
        <SessionTester />
      </div>
    </div>
  );
}
