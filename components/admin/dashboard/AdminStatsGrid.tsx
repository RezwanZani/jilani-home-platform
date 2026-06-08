import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DollarSign, Users, Building2, CheckCircle2, TrendingUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsGridProps {
  stats: {
    totalRevenue: number;
    revenueGrowth: string;
    totalUsers: number;
    usersGrowth: string;
    totalListings: number;
    propertiesGrowth: string;
    pendingApprovals: number;
  };
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const STATS = [
    { 
      label: "Total Revenue", 
      value: `৳${stats.totalRevenue.toLocaleString()}`, 
      change: stats.revenueGrowth, 
      up: !stats.revenueGrowth.startsWith("-") && stats.revenueGrowth !== "0%", 
      icon: DollarSign, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50 dark:bg-emerald-500/10", 
      border: "border-emerald-200 dark:border-emerald-500/20" 
    },
    { 
      label: "Active Users", 
      value: stats.totalUsers.toLocaleString(), 
      change: stats.usersGrowth, 
      up: !stats.usersGrowth.startsWith("-") && stats.usersGrowth !== "0%", 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-50 dark:bg-blue-500/10", 
      border: "border-blue-200 dark:border-blue-500/20" 
    },
    { 
      label: "Total Properties", 
      value: stats.totalListings.toLocaleString(), 
      change: stats.propertiesGrowth, 
      up: !stats.propertiesGrowth.startsWith("-") && stats.propertiesGrowth !== "0%", 
      icon: Building2, 
      color: "text-purple-500", 
      bg: "bg-purple-50 dark:bg-purple-500/10", 
      border: "border-purple-200 dark:border-purple-500/20" 
    },
    { 
      label: "Pending Approvals", 
      value: stats.pendingApprovals.toLocaleString(), 
      change: "Action Required", 
      up: false, 
      icon: CheckCircle2, 
      color: "text-amber-500", 
      bg: "bg-amber-50 dark:bg-amber-500/10", 
      border: "border-amber-200 dark:border-amber-500/20" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {STATS.map((s, i) => (
        <GlassCard 
          key={s.label} 
          className="p-6 bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/5 hover:border-blue-500/20 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            {s.change === "Action Required" ? (
              <div className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-amber-600 bg-amber-100 dark:text-amber-500 dark:bg-amber-500/10">
                {s.change}
              </div>
            ) : (
              <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
                s.up ? "text-emerald-600 bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-100 dark:text-rose-500 dark:bg-rose-500/10"
              )}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {s.change}
              </div>
            )}
          </div>
          <div className="mt-5">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
