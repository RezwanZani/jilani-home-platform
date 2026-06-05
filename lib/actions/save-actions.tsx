"use server";

import { db } from "@/lib/db";
import { savedProperties } from "@/lib/db/schema";
import { auth } from "@/lib/auth"; // Adjust to your Auth.js / NextAuth import
import { and, eq } from "drizzle-orm";
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