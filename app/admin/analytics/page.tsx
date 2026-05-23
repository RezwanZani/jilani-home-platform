'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const MONTHLY = [
  { name: "Aug", revenue: 42000, users: 820, bookings: 340 },
  { name: "Sep", revenue: 51200, users: 940, bookings: 410 },
  { name: "Oct", revenue: 47800, users: 880, bookings: 390 },
  { name: "Nov", revenue: 59300, users: 1020, bookings: 480 },
  { name: "Dec", revenue: 72100, users: 1340, bookings: 610 },
  { name: "Jan", revenue: 68400, users: 1180, bookings: 540 },
  { name: "Feb", revenue: 78900, users: 1420, bookings: 670 },
  { name: "Mar", revenue: 85300, users: 1560, bookings: 720 },
];

const CATEGORY = [
  { name: "Office Space", value: 45 },
  { name: "Event Hall", value: 30 },
  { name: "Residential", value: 25 },
];

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

const METRICS = [
  { label: "Total Revenue", value: "$85,300", change: "+8.1%", up: true },
  { label: "Conversion Rate", value: "3.8%", change: "+0.4%", up: true },
  { label: "Avg. Session", value: "4m 12s", change: "+22s", up: true },
  { label: "Churn Rate", value: "2.1%", change: "-0.3%", up: true },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 mb-2 font-bold uppercase tracking-widest text-[10px]">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold flex items-center justify-between gap-6 text-xs">
            <span className="uppercase tracking-tight opacity-80">{p.name}:</span>
            <span>{p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30D");

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Data Insights</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Platform Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Visualize platform growth, revenue streams, and user retention.</p>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
          {["7D", "30D", "90D", "1Y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                period === p 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{m.label}</p>
                <span className={cn("flex items-center gap-1 text-[11px] font-bold tracking-tight", m.up ? "text-emerald-600" : "text-red-500")}>
                  {m.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {m.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{m.value}</h3>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <LineIcon className="w-5 h-5 text-blue-600" />
                Revenue & Engagement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Correlation between platform revenue and active bookings</p>
            </div>
            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">{v}</span>} />
                <Line name="revenue" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7, strokeWidth: 0 }} />
                <Line name="bookings" type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="6 6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm min-h-[450px]">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-blue-600" />
              Inventory Mix
           </h2>
           <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0} paddingAngle={8}>
                    {CATEGORY.map((_, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Mix</p>
              </div>
           </div>
           <div className="mt-10 space-y-4">
              {CATEGORY.map((c, idx) => (
                <div key={c.name} className="flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ background: COLORS[idx] }} />
                    <span className="text-gray-500 dark:text-gray-400">{c.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">{c.value}%</span>
                </div>
              ))}
           </div>
        </GlassCard>
      </div>

      <GlassCard className="p-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm min-h-[350px]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-blue-600" />
           New User Acquisition
        </h2>
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)", radius: 8 }} content={<CustomTooltip />} />
              <Bar name="new users" dataKey="users" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
