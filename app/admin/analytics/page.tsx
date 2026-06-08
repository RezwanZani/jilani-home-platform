import React from "react";
import { getAdminAnalytics } from "@/lib/actions/admin-analytics-actions";
import { 
  AnalyticsTopMetrics, 
  AnalyticsRevenueLineChart, 
  AnalyticsInventoryPieChart, 
  AnalyticsUserBarChart 
} from "@/components/admin/analytics/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { METRICS, CATEGORY, MONTHLY } = await getAdminAnalytics();

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-500 uppercase">Data Insights</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Platform Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Visualize platform growth, revenue streams, and user retention.</p>
        </div>
      </div>

      <AnalyticsTopMetrics metrics={METRICS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnalyticsRevenueLineChart data={MONTHLY} />
        <AnalyticsInventoryPieChart data={CATEGORY} />
      </div>

      <AnalyticsUserBarChart data={MONTHLY} />
    </div>
  );
}
