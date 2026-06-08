"use server";

import { db } from "@/lib/db";
import { transactions, users, properties } from "@/lib/db/schema";
import { eq, sql, desc, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function getAdminDashboardStats() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Helpers
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percent = ((current - previous) / previous) * 100;
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  // 1. Totals
  const revenueResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(eq(transactions.status, "success"));
  const totalRevenue = Number(revenueResult[0]?.total || 0);

  const usersResult = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(isNull(users.deletedAt));
  const totalUsers = Number(usersResult[0]?.count || 0);

  const propertiesResult = await db.select({ count: sql<number>`count(*)` })
    .from(properties).where(eq(properties.status, "active"));
  const totalListings = Number(propertiesResult[0]?.count || 0);

  const pendingResult = await db.select({ count: sql<number>`count(*)` })
    .from(transactions).where(eq(transactions.status, "pending"));
  const pendingApprovals = Number(pendingResult[0]?.count || 0);

  // 2. Growths (Last 30 Days vs Previous 30 Days)
  const currentRevResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '30 days'`));
  const prevRevResult = await db.select({ total: sql<number>`sum(amount_paid)` })
    .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '60 days'`, sql`created_at < NOW() - INTERVAL '30 days'`));
  const revenueGrowth = calculateGrowth(Number(currentRevResult[0]?.total || 0), Number(prevRevResult[0]?.total || 0));

  const currentUsersRes = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(and(isNull(users.deletedAt), sql`created_at >= NOW() - INTERVAL '30 days'`));
  const prevUsersRes = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(and(isNull(users.deletedAt), sql`created_at >= NOW() - INTERVAL '60 days'`, sql`created_at < NOW() - INTERVAL '30 days'`));
  const usersGrowth = calculateGrowth(Number(currentUsersRes[0]?.count || 0), Number(prevUsersRes[0]?.count || 0));

  const currentPropRes = await db.select({ count: sql<number>`count(*)` })
    .from(properties).where(and(eq(properties.status, "active"), sql`created_at >= NOW() - INTERVAL '30 days'`));
  const prevPropRes = await db.select({ count: sql<number>`count(*)` })
    .from(properties).where(and(eq(properties.status, "active"), sql`created_at >= NOW() - INTERVAL '60 days'`, sql`created_at < NOW() - INTERVAL '30 days'`));
  const propertiesGrowth = calculateGrowth(Number(currentPropRes[0]?.count || 0), Number(prevPropRes[0]?.count || 0));

  // 3. Recent Transactions
  const recentTxs = await db.select({
    id: transactions.id,
    amount: transactions.amountPaid,
    status: transactions.status,
    createdAt: transactions.createdAt,
    userName: users.name,
  })
  .from(transactions)
  .leftJoin(users, eq(transactions.userId, users.id))
  .orderBy(desc(transactions.createdAt))
  .limit(5);

  // 4. Chart Data
  const chartDataWeeklyRaw = await db.select({
    date: sql<string>`DATE(created_at)`,
    value: sql<number>`sum(amount_paid)`
  })
  .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '7 days'`))
  .groupBy(sql`DATE(created_at)`).orderBy(sql`DATE(created_at)`);

  const chartDataMonthlyRaw = await db.select({
    date: sql<string>`DATE(created_at)`,
    value: sql<number>`sum(amount_paid)`
  })
  .from(transactions).where(and(eq(transactions.status, "success"), sql`created_at >= NOW() - INTERVAL '30 days'`))
  .groupBy(sql`DATE(created_at)`).orderBy(sql`DATE(created_at)`);

  return {
    totalRevenue,
    revenueGrowth,
    totalUsers,
    usersGrowth,
    totalListings,
    propertiesGrowth,
    pendingApprovals,
    recentTxs,
    chartDataWeekly: fillLastNDays(chartDataWeeklyRaw, 7),
    chartDataMonthly: fillLastNDays(chartDataMonthlyRaw, 30)
  };
}

function fillLastNDays(data: any[], days: number) {
  const result = [];
  const today = new Date();
  
  const dataMap = new Map();
  data.forEach(d => {
    try {
      const dStr = new Date(d.date).toISOString().split('T')[0];
      dataMap.set(dStr, Number(d.value));
    } catch(e) {
      // ignore
    }
  });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    
    // For weekly show day name, for monthly show date (e.g. "May 12")
    const label = days <= 7 
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
    result.push({
      name: label,
      value: dataMap.get(dStr) || 0
    });
  }
  return result;
}
