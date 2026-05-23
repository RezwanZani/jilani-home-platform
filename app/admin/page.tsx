'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  Wallet,
  Shield,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const DATA = [
  { name: "Mon", value: 4200 },
  { name: "Tue", value: 3800 },
  { name: "Wed", value: 5200 },
  { name: "Thu", value: 4100 },
  { name: "Fri", value: 6800 },
  { name: "Sat", value: 8100 },
  { name: "Sun", value: 9500 },
];

const STATS = [
  { label: "Total Revenue", value: "৳124,592", change: "+12.5%", up: true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "Active Users", value: "8,432", change: "+4.3%", up: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "New Listings", value: "142", change: "-2.1%", up: false, icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { label: "Avg. Session", value: "4m 12s", change: "+0.8%", up: true, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("weekly");

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase">Executive Intelligence</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            System <span className="text-blue-600">Overview</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Real-time platform performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-gray-400">May 02 — May 09, 2024</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <motion.div 
            key={s.label} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-6 bg-[#0B1121] border-white/5 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
                  s.up ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                )}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                  {s.change}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{s.value}</h3>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Chart Area - Horizontal Growth Analytics */}
        <GlassCard className="lg:col-span-8 p-0 bg-[#0B1121] border-white/5 overflow-hidden">
          <div className="p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Growth Analytics</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Revenue trajectory & user acquisition velocity</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              {["weekly", "monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[380px] w-full px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ fontSize: "10px", marginBottom: "4px", color: "#64748b" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 border-t border-white/5 bg-white/2">
             {[
               { label: "Total Volume", value: "৳41,204", color: "text-blue-500" },
               { label: "Growth Rate", value: "14.2%", color: "text-emerald-500" },
               { label: "Avg. Daily", value: "৳5,886", color: "text-purple-500" },
             ].map((m) => (
               <div key={m.label} className="p-6 border-r border-white/5 last:border-r-0">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{m.label}</p>
                  <p className={cn("text-xl font-bold mt-1", m.color)}>{m.value}</p>
               </div>
             ))}
          </div>
        </GlassCard>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
           {/* Payouts Card */}
           <GlassCard className="p-6 bg-[#0B1121] border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Recent Payouts</h3>
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { user: "Marcus Rivera", amount: "৳1,240.00", status: "Completed", date: "Feb 12", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { user: "Olivia Chen", amount: "৳3,850.00", status: "Pending", date: "Feb 14", color: "text-amber-500", bg: "bg-amber-500/10" },
                  { user: "James Park", amount: "৳940.00", status: "Completed", date: "Feb 15", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-white/2 border border-white/5 hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Wallet className="w-4.5 h-4.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white leading-tight">{item.amount}</p>
                        <p className="text-[9px] font-bold text-gray-500 mt-0.5 uppercase tracking-tight">{item.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-current", item.color, item.bg)}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-5 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                View Transactions
              </button>
           </GlassCard>

           {/* Security Sentinel Card */}
           <GlassCard className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <h3 className="text-base font-bold text-white">Security Sentinel</h3>
                   </div>
                   <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/20">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Secure</span>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Failed Attempts</span>
                      <span className="text-xs font-bold text-white">0</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Integrity</span>
                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">VERIFIED</span>
                   </div>
                   <button className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-2">
                      Audit Sentinel <ArrowRight className="w-3 h-3" />
                   </button>
                </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
