"use server";

import { db } from "@/lib/db";
import { unlocks, users, properties, ownerContacts, propertyLocationsPrivate, zones, propertyImages } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
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

export async function getUnlockedProperties(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return { success: false, error: "UNAUTHORIZED", data: [], hasMore: false };
        }

        const data = await db
            .select({
                property: properties,
                zone: {
                    id: zones.id,
                    name: zones.name,
                    city: zones.city,
                    thana: zones.thana,
                    area: zones.area,
                },
                unlockedAt: unlocks.unlockedAt,
                expiresAt: unlocks.expiresAt,
                unlockedId: unlocks.id
            })
            .from(properties)
            .innerJoin(unlocks, and(
                eq(unlocks.propertyId, properties.id),
                eq(unlocks.userId, userId as string),
                gte(unlocks.expiresAt, new Date()) // only active unlocks
            ))
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .orderBy(desc(unlocks.unlockedAt))
            .limit(limit + 1)
            .offset(offset);

        const hasMore = data.length > limit;
        const resultData = hasMore ? data.slice(0, -1) : data;

        const finalData: any[] = [];
        // Fetch the images for all properties
        for (let i = 0; i < resultData.length; i++) {
            const imagesData = await db
                .select({ url: propertyImages.imageUrl })
                .from(propertyImages)
                .where(eq(propertyImages.propertyId, resultData[i].property.id));

            const imageUrls = imagesData.map(img => img.url);
            if (resultData[i].property.coverImage) {
                 imageUrls.unshift(resultData[i].property.coverImage as string);
            }

            finalData.push({
                data: { ...resultData[i].property, images: imageUrls },
                zone: resultData[i].zone,
                unlockedAt: resultData[i].unlockedAt,
                expiresAt: resultData[i].expiresAt,
                unlockedId: resultData[i].unlockedId
            });
        }

        return { success: true, data: finalData, hasMore };
    } catch (error) {
        console.error("Database error fetching unlocked properties:", error);
        return { success: false, data: [], hasMore: false };
    }
}