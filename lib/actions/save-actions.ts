"use server";

import { db } from "@/lib/db";
import { properties, propertyImages, savedProperties, unlocks, zones } from "@/lib/db/schema";
import { auth } from "@/lib/auth"; // Adjust to your Auth.js / NextAuth import
import { and, eq, gte, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleSaveProperty(propertyId: string) {
    try {
        const session = await auth();

        // 1. Auth Check
        if (!session?.user?.id) {
            return { success: false, error: "UNAUTHORIZED" };
        }

        const userId = session.user.id;

        // 2. Check if already saved
        const existingSave = await db.select()
            .from(savedProperties)
            .where(
                and(
                    eq(savedProperties.userId, userId),
                    eq(savedProperties.propertyId, propertyId)
                )
            );

        // 3. Toggle Logic
        if (existingSave.length > 0) {
            // Remove from saved
            await db.delete(savedProperties).where(eq(savedProperties.id, existingSave[0].id));
            revalidatePath('/listings'); // Refresh UI cache
            return { success: true, isSaved: false, message: "Removed from saved spaces." };
        } else {
            // Add to saved
            await db.insert(savedProperties).values({ userId, propertyId });
            revalidatePath('/listings'); // Refresh UI cache
            return { success: true, isSaved: true, message: "Property saved successfully!" };
        }
    } catch (error) {
        console.error("Error toggling saved property:", error);
        return { success: false, error: "DATABASE_ERROR" };
    }
}

export async function checkIfPropertyIsSaved(propertyId: string) {
    try {
        const session = await auth(); // Or however you get your session

        if (!session?.user?.id) return false;

        const existingSave = await db.select()
            .from(savedProperties)
            .where(
                and(
                    eq(savedProperties.userId, session.user.id),
                    eq(savedProperties.propertyId, propertyId)
                )
            );

        return existingSave.length > 0;
    } catch (error) {
        console.error("Error checking saved status:", error);
        return false;
    }
}

export async function getSavedProperties() {
    try {
        //Get the user
        const session = await auth();
        const userId = session?.user?.id;

        if (!session?.user?.id) {
            return { success: false, error: "UNAUTHORIZED" };
        }

        // Create the Unlock Join Condition
        const unlockJoinCondition = userId
            ? and(
                eq(unlocks.propertyId, properties.id),
                eq(unlocks.userId, userId),
                gte(unlocks.expiresAt, new Date()) // Must be active!
            )
            : sql`FALSE`;

        const data = await db
            // 1. Explicitly select the property data AND the joined zone data
            .select({
                property: properties,
                zone: {
                    id: zones.id,
                    name: zones.name,
                    city: zones.city,
                    thana: zones.thana,
                    area: zones.area,
                },
                // If savedId is not null, the user has saved this property
                savedAt: savedProperties.createdAt,
                unlockedId: unlocks.id
            })
            .from(properties)
            .innerJoin(savedProperties, and(
                eq(savedProperties.propertyId, properties.id),
                eq(savedProperties.userId, userId as string)
            ))
            // 2. Join the zones table where the IDs match
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .leftJoin(unlocks, unlockJoinCondition)
            .orderBy(desc(savedProperties.createdAt));

        const finalData: any[] = [];
        // Fetch the images for all properties
        for (let i = 0; i < data.length; i++) {
            const imagesData = await db
                .select({ url: propertyImages.imageUrl })
                .from(propertyImages)
                .where(eq(propertyImages.propertyId, data[i].property.id));

            const imageUrls = imagesData.map(img => img.url);
            imageUrls.unshift(data[i].property.coverImage as string);

            finalData.push({
                data: { ...data[i].property, images: imageUrls },
                zone: data[i].zone,
                savedAt: data[i].savedAt,
                unlockedId: data[i].unlockedId
            });
        }

        return { success: true, data: finalData };
    } catch (error) {
        console.error("Database error fetching top properties:", error);
        return { success: false, data: [] };
    }
}

export async function deleteSavedProperty(propertyId: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return { success: false, error: "UNAUTHORIZED" };
        }

        await db.delete(savedProperties).where(
            and(
                eq(savedProperties.userId, userId),
                eq(savedProperties.propertyId, propertyId)
            )
        );

        revalidatePath('/dashboard/saved');
        return { success: true };
    } catch (error) {
        console.error("Error deleting saved property:", error);
        return { success: false, error: "DATABASE_ERROR" };
    }
}