"use server";

import { db } from "@/lib/db";
import { transactions, users, properties, unlocks } from "@/lib/db/schema";
import { eq, sql, gte, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function getAdminAnalytics() {
  console.log("[Analytics Action] Starting getAdminAnalytics");
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    console.log("[Analytics Action] Unauthorized");
    throw new Error("Unauthorized");
  }

  console.log("[Analytics Action] Step 1: Top Metrics");
  // 1. Get Top Level Metrics
  const revenueResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(eq(transactions.status, "success"));
  const totalRevenue = Number(revenueResult[0]?.total || 0);

  const usersResult = await db.select({ count: sql<number>`count(*)`, sum: sql<number>`sum(points_balance)` })
    .from(users).where(isNull(users.deletedAt));
  const totalUsers = Number(usersResult[0]?.count || 0);
  const sumPoints = Number(usersResult[0]?.sum || 0);
  const avgPointBalance = totalUsers > 0 ? Math.round(sumPoints / totalUsers) : 0;

  const unlocksResult = await db.select({ count: sql<number>`count(*)` }).from(unlocks);
  const totalUnlocks = Number(unlocksResult[0]?.count || 0);

  console.log("[Analytics Action] Step 2: Growths");
  // 2. Growths (Last 30 Days vs Previous 30 Days for Revenue)
  // For simplicity we will just show the total value for these metrics and we can add growth if needed,
  // but let's implement basic growth for revenue and signups.
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percent = ((current - previous) / previous) * 100;
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  const currentRevResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '30 days'`));
  const prevRevResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '60 days'`, sql`created_at < NOW() - INTERVAL '30 days'`));
  const revGrowth = calculateGrowth(Number(currentRevResult[0]?.total || 0), Number(prevRevResult[0]?.total || 0));

  const currentUsersRes = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(and(isNull(users.deletedAt), sql`created_at >= NOW() - INTERVAL '30 days'`));
  const prevUsersRes = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(and(isNull(users.deletedAt), sql`created_at >= NOW() - INTERVAL '60 days'`, sql`created_at < NOW() - INTERVAL '30 days'`));
  const userGrowth = calculateGrowth(Number(currentUsersRes[0]?.count || 0), Number(prevUsersRes[0]?.count || 0));

  const METRICS = [
    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, change: revGrowth, up: !revGrowth.startsWith("-") && revGrowth !== "0%" },
    { label: "Total Signups", value: totalUsers.toLocaleString(), change: userGrowth, up: !userGrowth.startsWith("-") && userGrowth !== "0%" },
    { label: "Properties Unlocked", value: totalUnlocks.toLocaleString(), change: "All Time", up: true },
    { label: "Avg. Point Balance", value: avgPointBalance.toLocaleString(), change: "Active", up: true },
  ];

  console.log("[Analytics Action] Step 3: Category Mix");
  // 3. Category / Inventory Mix
  const props = await db.select({ type: properties.type }).from(properties).where(eq(properties.status, "active"));
  const mixMap = new Map<string, number>();
  props.forEach(p => {
    const t = p.type || "Other";
    mixMap.set(t, (mixMap.get(t) || 0) + 1);
  });
  const totalProps = props.length || 1;
  const CATEGORY = Array.from(mixMap.entries()).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: Math.round((v / totalProps) * 100)
  })).sort((a, b) => b.value - a.value);

  console.log("[Analytics Action] Step 4: Monthly Timeline");
  // 4. Monthly Timeline (Last 8 Months)
  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 7);
  eightMonthsAgo.setDate(1);

  const txs = await db.select({ amount: transactions.amountPaid, createdAt: transactions.createdAt })
    .from(transactions).where(and(eq(transactions.status, 'success'), gte(transactions.createdAt, eightMonthsAgo)));
  const usrs = await db.select({ createdAt: users.createdAt })
    .from(users).where(gte(users.createdAt, eightMonthsAgo));
  const unlks = await db.select({ createdAt: unlocks.unlockedAt })
    .from(unlocks).where(gte(unlocks.unlockedAt, eightMonthsAgo));

  const monthsMap = new Map<string, any>();
  for(let i=7; i>=0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const name = d.toLocaleDateString('en-US', { month: 'short' });
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthsMap.set(key, { name, revenue: 0, users: 0, bookings: 0 });
  }

  txs.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if(monthsMap.has(key)) {
      monthsMap.get(key).revenue += Number(t.amount);
    }
  });

  usrs.forEach(u => {
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if(monthsMap.has(key)) {
      monthsMap.get(key).users += 1;
    }
  });

  unlks.forEach(u => {
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if(monthsMap.has(key)) {
      monthsMap.get(key).bookings += 1;
    }
  });

  const MONTHLY = Array.from(monthsMap.values());

  console.log("[Analytics Action] Completed successfully");
  return {
    METRICS,
    CATEGORY,
    MONTHLY
  };
}
