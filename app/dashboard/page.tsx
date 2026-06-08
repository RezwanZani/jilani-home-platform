import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiries, pointPackages, promoCodes } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/overview/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/overview/StatsGrid";
import { ActiveUnlocks } from "@/components/dashboard/overview/ActiveUnlocks";
import { TabbedHistory } from "@/components/dashboard/overview/TabbedHistory";
import { DashboardSidebar } from "@/components/dashboard/overview/DashboardSidebar";
import { SessionTester } from '@/components/SessionTester';
import { getUserBalance, getUnlockedProperties } from "@/lib/actions/unlock-actions";
import { getSavedProperties } from "@/lib/actions/save-actions";

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session?.user) return <div>Please log in</div>;

  const userId = session.user.id;

  // Fetch metrics data
  const pointsBalance = await getUserBalance() || 0;

  const unlockedRes = await getUnlockedProperties(1, 10);
  const activeUnlocks = unlockedRes.data || [];

  const savedRes = await getSavedProperties();
  const savedSpaces = savedRes.data || [];

  // Fetch inquiries manually since there's no action
  const userInquiries = await db.select()
    .from(inquiries)
    .where(eq(inquiries.userId, userId))
    .orderBy(desc(inquiries.createdAt))
    .limit(10);

  // Fetch Point Packages
  const activePackages = await db.select()
    .from(pointPackages)
    .where(eq(pointPackages.isActive, true))
    .orderBy(asc(pointPackages.points))
    .limit(3);

  // Fetch Promo
  const promoData = await db.select()
    .from(promoCodes)
    .where(eq(promoCodes.code, 'WELCOME20'))
    .limit(1);

  const promo = promoData[0] || { code: 'WELCOME20', discountValue: 20, discountType: 'percentage' };

  // Stats data
  const stats = {
    pointsBalance,
    activeUnlocksCount: activeUnlocks.length,
    savedSpacesCount: savedSpaces.length,
    inquiriesCount: userInquiries.length
  };

  return (
    <div className="space-y-8 font-sans">
      <DashboardHeader user={session.user} />

      {/* Row 1: Fast-Fact Metric Cards */}
      <StatsGrid stats={stats} />

      {/* Row 2: Active Unlocked Spaces (Left) & Fast Top-Up (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActiveUnlocks initialSpaces={activeUnlocks} />
        </div>

        <div className="space-y-8">
          <DashboardSidebar packages={activePackages} promo={promo} user={session.user} />
        </div>
      </div>

      {/* Row 3: Saved Properties & Recent Inquiries Tabbed View */}
      <div className="grid grid-cols-1 gap-8">
        <div className="w-full">
          <TabbedHistory savedSpaces={savedSpaces} inquiries={userInquiries} />
        </div>
      </div>
    </div>
  );
}
