import React from "react";
import { Calendar } from "lucide-react";
import { AdminStatsGrid } from "@/components/admin/dashboard/AdminStatsGrid";
import { AdminSidebar } from "@/components/admin/dashboard/AdminSidebar";
import { getAdminDashboardStats } from "@/lib/actions/admin-dashboard-actions";
import { AdminRevenueChart } from "@/components/admin/dashboard/AdminRevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const dateRangeStr = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
        <div className="flex items-center gap-3 bg-white dark:bg-white/5 shadow-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{dateRangeStr}</span>
        </div>
      </div>

      <AdminStatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AdminRevenueChart 
          dataWeekly={stats.chartDataWeekly} 
          dataMonthly={stats.chartDataMonthly} 
          totalVolume={stats.totalRevenue} 
          revenueGrowth={stats.revenueGrowth}
        />
        <AdminSidebar recentTxs={stats.recentTxs as any} pendingApprovals={stats.pendingApprovals} />
      </div>
    </div>
  );
}
