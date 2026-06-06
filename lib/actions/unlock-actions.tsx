"use server";

import { db } from "@/lib/db";
import { unlocks, users, properties, ownerContacts, propertyLocationsPrivate } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UNLOCK_COST = 50;

export async function unlockPropertyContact(propertyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };
        const userId = session.user.id;

        // 1. Get Property, Owner Info, AND Private Location Data
        const propertyData = await db.select({
            prop: properties,
            owner: ownerContacts,
            privateLocation: propertyLocationsPrivate // Fetch private address
        })
            .from(properties)
            .leftJoin(ownerContacts, eq(properties.ownerId, ownerContacts.id))
            // Join the private locations table securely
            .leftJoin(propertyLocationsPrivate, eq(properties.id, propertyLocationsPrivate.propertyId))
            .where(eq(properties.id, propertyId))
            .limit(1);

        if (propertyData.length === 0) return { success: false, error: "NOT_FOUND" };

        // 2. Format the real private address cleanly
        const pLoc = propertyData[0].privateLocation;
        const realData = {
            ownerName: propertyData[0].owner?.name || "N/A",
            phone: propertyData[0].owner?.phone || "N/A",
            whatsapp: propertyData[0].owner?.whatsapp || "Not Provided",
            house: pLoc?.house || "",
            road: pLoc?.road || "",
            block: pLoc?.block || "",
            landmark: pLoc?.landmark || "",
            additionalLine: pLoc?.additionalLine || "",
        };

        // 3. Check if already actively unlocked
        const activeUnlock = await db.select().from(unlocks).where(
            and(
                eq(unlocks.userId, userId),
                eq(unlocks.propertyId, propertyId),
                gte(unlocks.expiresAt, new Date())
            )
        ).limit(1);

        if (activeUnlock.length > 0) {
            return { success: true, data: realData };
        }

        // 4. Check Balance
        const currentUser = await db.select({ points: users.pointsBalance }).from(users).where(eq(users.id, userId)).limit(1);
        if (currentUser[0].points < UNLOCK_COST) {
            return { success: false, error: "INSUFFICIENT_FUNDS", required: UNLOCK_COST };
        }

        // 5. Calculate Expiration (2 Months)
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 2);

        // 6. TRANSACTION
        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ pointsBalance: currentUser[0].points - UNLOCK_COST })
                .where(eq(users.id, userId));

            await tx.insert(unlocks).values({
                userId,
                propertyId,
                pointsSpent: UNLOCK_COST,
                unlockedAt: now,
                expiresAt: expiresAt
            }).onConflictDoUpdate({
                target: [unlocks.userId, unlocks.propertyId],
                set: { pointsSpent: UNLOCK_COST, unlockedAt: now, expiresAt: expiresAt }
            });
        });

        // Trigger Next.js to refresh the page cache instantly
        revalidatePath(`/listings/${propertyData[0].prop.slug}`);

        return { success: true, data: realData };
    } catch (error) {
        console.error("Unlock error:", error);
        return { success: false, error: "DATABASE_ERROR" };
    }
}


export async function getUserBalance() {
    try {
        const session = await auth();
        const isLoggedIn = !!session?.user?.id;

        let userBalance = 0;
        if (isLoggedIn) {
            const userDb = await db.select({ pointsBalance: users.pointsBalance })
                .from(users)
                .where(eq(users.id, session.user.id))
                .limit(1);
            if (userDb.length > 0) userBalance = userDb[0].pointsBalance;
        }
        return userBalance;

    } catch (error) {
        return false;
    }
}