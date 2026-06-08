"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminRevenueChartProps {
  dataWeekly: { name: string; value: number }[];
  dataMonthly: { name: string; value: number }[];
  totalVolume: number;
  revenueGrowth: string;
}

export function AdminRevenueChart({ dataWeekly, dataMonthly, totalVolume, revenueGrowth }: AdminRevenueChartProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const chartData = activeTab === "weekly" ? dataWeekly : dataMonthly;
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  return (
    <GlassCard className="lg:col-span-8 p-0 bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/5 overflow-hidden">
      <div className="p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Growth Analytics</h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Revenue trajectory (Last {activeTab === "weekly" ? "7" : "30"} Days)
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/5">
          {["weekly", "monthly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full px-4">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData ?? []}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" vertical={false} />
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
        ) : null}
      </div>

      <div className="grid grid-cols-3 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
          {[
            { label: activeTab === "weekly" ? "7D Volume" : "30D Volume", value: `৳${totalVolume.toLocaleString()}`, color: "text-blue-600 dark:text-blue-500" },
            { label: "MoM Growth Rate", value: revenueGrowth, color: "text-emerald-600 dark:text-emerald-500" },
            { label: "Avg. Daily", value: `৳${(totalVolume / (activeTab === "weekly" ? 7 : 30)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-purple-600 dark:text-purple-500" },
          ].map((m) => (
            <div key={m.label} className="p-6 border-r border-gray-200 dark:border-white/5 last:border-r-0">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{m.label}</p>
              <p className={cn("text-xl font-bold mt-1", m.color)}>{m.value}</p>
            </div>
          ))}
      </div>
    </GlassCard>
  );
}
