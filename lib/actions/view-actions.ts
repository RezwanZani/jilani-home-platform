"use server";

import { db } from "@/lib/db";
import { properties, propertyViewHistory } from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function trackPropertyView(propertyId: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        // Next.js 15: headers() is awaited 
        const headersList = await headers();
        const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown_ip";

        // Calculate the threshold (24 hours ago)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Build the condition based on login status
        const cooldownCondition = userId
            ? and(
                eq(propertyViewHistory.propertyId, propertyId),
                eq(propertyViewHistory.userId, userId),
                gt(propertyViewHistory.viewedAt, twentyFourHoursAgo)
            )
            : and(
                eq(propertyViewHistory.propertyId, propertyId),
                eq(propertyViewHistory.ipAddress, ipAddress),
                gt(propertyViewHistory.viewedAt, twentyFourHoursAgo)
            );

        // 2. Check if a view exists in the last 24 hours
        const recentView = await db.select({ id: propertyViewHistory.id })
            .from(propertyViewHistory)
            .where(cooldownCondition)
            .limit(1);

        // If they already viewed it today, stop here.
        if (recentView.length > 0) return { success: true, message: "Already counted today" };

        // 3. If unique view, run an atomic transaction
        await db.transaction(async (tx) => {
            // A. Log the view
            await tx.insert(propertyViewHistory).values({
                propertyId,
                userId: userId || null,
                ipAddress: ipAddress,
            });

            // B. Increment the main property view count using SQL increment
            await tx.update(properties)
                .set({ viewsCount: sql`${properties.viewsCount} + 1` })
                .where(eq(properties.id, propertyId));
        });

        return { success: true, message: "View tracked" };

    } catch (error) {
        console.error("Error tracking view:", error);
        return { success: false, error: "Failed to track view" };
    }
}