'use client';

import React from "react";
import { useUser } from "@/components/providers/UserProvider";
import { DashboardHeader } from "@/components/dashboard/overview/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/overview/StatsGrid";
import { RecentlyViewed } from "@/components/dashboard/overview/RecentlyViewed";
import { ActivityTimeline } from "@/components/dashboard/overview/ActivityTimeline";
import { DashboardSidebar } from "@/components/dashboard/overview/DashboardSidebar";
import { SessionTester } from '@/components/SessionTester';

export default function UserDashboardPage() {
  const user = useUser();

  return (
    <div className="space-y-10">
      <DashboardHeader user={user} />
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <RecentlyViewed />
          <ActivityTimeline />
        </div>

        <div className="space-y-8">
          <DashboardSidebar />
        </div>

        {/* DEBUG TOOL (Remove in production) */}
        <SessionTester />
      </div>
    </div>
  );
}
