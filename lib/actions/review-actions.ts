"use server";

import { db } from "@/lib/db";
import { propertyReviews, users, properties, unlocks } from "@/lib/db/schema";
import { eq, gte, desc, asc, ilike, inArray, and, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to recalculate a property's rating
async function recalculatePropertyRating(propertyId: string) {
    try {
        // We only count 'pending' and 'approved' reviews. 'rejected' and deleted ones are excluded.
        const validReviews = await db
            .select({
                rating: propertyReviews.rating
            })
            .from(propertyReviews)
            .where(
                and(
                    eq(propertyReviews.propertyId, propertyId),
                    or(
                        eq(propertyReviews.status, 'pending'),
                        eq(propertyReviews.status, 'approved')
                    )
                )
            );

        const totalReviews = validReviews.length;
        let averageRating = 0;

        if (totalReviews > 0) {
            const sum = validReviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = sum / totalReviews;
        }

        await db
            .update(properties)
            .set({
                averageRating: averageRating.toFixed(2),
                totalReviews
            })
            .where(eq(properties.id, propertyId));

    } catch (error) {
        console.error("Failed to recalculate property rating:", error);
    }
}

export async function fetchReviews(page: number, limit: number = 20, search = "", statusFilter: string = "all") {
    const offset = (page - 1) * limit;

    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            throw new Error("Unauthorized access");
        }

        const conditions = [];

        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            conditions.push(
                or(
                    ilike(users.name, term),
                    ilike(properties.title, term)
                )
            );
        }

        if (statusFilter !== "all") {
            conditions.push(eq(propertyReviews.status, statusFilter as "pending" | "approved" | "rejected"));
        }

        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db
            .select({
                id: propertyReviews.id,
                propertyId: propertyReviews.propertyId,
                userId: propertyReviews.userId,
                rating: propertyReviews.rating,
                message: propertyReviews.message,
                status: propertyReviews.status,
                createdAt: propertyReviews.createdAt,

                userName: users.name,
                userEmail: users.email,

                propertyTitle: properties.title,
                propertySlug: properties.slug,
            })
            .from(propertyReviews)
            .leftJoin(users, eq(propertyReviews.userId, users.id))
            .leftJoin(properties, eq(propertyReviews.propertyId, properties.id))
            .where(finalCondition)
            .limit(limit + 1)
            .orderBy(desc(propertyReviews.createdAt))
            .offset(offset);

        const hasMore = data.length > limit;
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error in fetchReviews:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function updateReviewStatus(id: string, propertyId: string, status: "approved" | "rejected" | "pending") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") throw new Error("Unauthorized");

        await db
            .update(propertyReviews)
            .set({ status })
            .where(eq(propertyReviews.id, id));

        await recalculatePropertyRating(propertyId);
        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error updating review:", error);
        throw new Error("Failed to update review status");
    }
}

export async function bulkUpdateReviewStatus(items: { id: string, propertyId: string }[], status: "approved" | "rejected" | "pending") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") throw new Error("Unauthorized");

        if (items.length === 0) return { success: true };

        const ids = items.map(i => i.id);
        const propertyIds = Array.from(new Set(items.map(i => i.propertyId)));

        await db
            .update(propertyReviews)
            .set({ status })
            .where(inArray(propertyReviews.id, ids));

        // Recalculate for all affected properties
        await Promise.all(propertyIds.map(pid => recalculatePropertyRating(pid)));

        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error bulk updating reviews:", error);
        throw new Error("Failed to bulk update review statuses");
    }
}

export async function deleteReview(id: string, propertyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") throw new Error("Unauthorized");

        await db.delete(propertyReviews).where(eq(propertyReviews.id, id));

        await recalculatePropertyRating(propertyId);
        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        throw new Error("Failed to delete review");
    }
}

export async function bulkDeleteReviews(items: { id: string, propertyId: string }[]) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") throw new Error("Unauthorized");

        if (items.length === 0) return { success: true };

        const ids = items.map(i => i.id);
        const propertyIds = Array.from(new Set(items.map(i => i.propertyId)));

        await db.delete(propertyReviews).where(inArray(propertyReviews.id, ids));

        // Recalculate for all affected properties
        await Promise.all(propertyIds.map(pid => recalculatePropertyRating(pid)));

        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting reviews:", error);
        throw new Error("Failed to bulk delete reviews");
    }
}

// 1. Submit or Edit Review
export async function submitReview(propertyId: string, rating: number, message: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };
        const userId = session.user.id;

        // NEW: 1. Verify the user has actually unlocked this property
        const hasUnlocked = await db.select()
            .from(unlocks) // Use your actual table name here
            .where(
                and(
                    eq(unlocks.userId, userId),
                    eq(unlocks.propertyId, propertyId)
                )
            )
            .limit(1);

        if (hasUnlocked.length === 0) {
            return {
                success: false,
                error: "FORBIDDEN",
                message: "You must unlock this property's contact info before leaving a review."
            };
        }

        // Auto-detect phone numbers (BD) and emails to prevent leaks
        const containsContactInfo = /[\w.-]+@[\w.-]+\.\w+|(\+88)?01[3-9]\d{8}/.test(message);
        const reviewStatus = containsContactInfo ? 'rejected' : 'pending';

        // Run in a transaction so rating averages are perfectly accurate
        await db.transaction(async (tx) => {
            // A. Upsert the review (Insert if new, Update if editing)
            await tx.insert(propertyReviews)
                .values({ propertyId, userId, rating, message, status: reviewStatus })
                .onConflictDoUpdate({
                    target: [propertyReviews.userId, propertyReviews.propertyId],
                    set: { rating, message, status: reviewStatus, updatedAt: new Date() }
                });

            // B. Recalculate average instantly! Only count pending and approved reviews.
            const stats = await tx.select({
                avg: sql<number>`COALESCE(AVG(${propertyReviews.rating}), 0)`,
                total: sql<number>`COUNT(${propertyReviews.id})`
            })
                .from(propertyReviews)
                .where(
                    and(
                        eq(propertyReviews.propertyId, propertyId),
                        or(
                            eq(propertyReviews.status, 'pending'),
                            eq(propertyReviews.status, 'approved')
                        )
                    )
                );

            // C. Update the property table
            await tx.update(properties)
                .set({
                    averageRating: Number(stats[0].avg).toFixed(2),
                    totalReviews: Number(stats[0].total)
                })
                .where(eq(properties.id, propertyId));
        });

        revalidatePath(`/listings`);
        return {
            success: true,
            message: reviewStatus === 'rejected'
                ? "Review flagged for containing contact info."
                : "Rating updated! Message is pending approval."
        };
    } catch (error) {
        console.error(error);
        return { success: false, error: "DATABASE_ERROR" };
    }
}


// 2. Fetch Reviews with Sorting
export async function getPropertyReviews(propertyId: string, sortBy: 'newest' | 'oldest' | 'highest' | 'lowest') {
    try {
        const session = await auth();
        const currentUserId = session?.user?.id;

        let orderByQuery = desc(propertyReviews.createdAt);
        if (sortBy === 'oldest') orderByQuery = asc(propertyReviews.createdAt);
        if (sortBy === 'highest') orderByQuery = desc(propertyReviews.rating);
        if (sortBy === 'lowest') orderByQuery = asc(propertyReviews.rating);

        const data = await db
            .select({
                id: propertyReviews.id,
                rating: propertyReviews.rating,
                message: propertyReviews.message,
                status: propertyReviews.status,
                createdAt: propertyReviews.createdAt,
                userId: propertyReviews.userId,
                userName: users.name, // Join user data
                userImage: users.image,
            })
            .from(propertyReviews)
            .leftJoin(users, eq(propertyReviews.userId, users.id)) // LEFT JOIN because user might be deleted!
            .where(
                and(
                    eq(propertyReviews.propertyId, propertyId),
                    or(
                        eq(propertyReviews.status, 'pending'),
                        eq(propertyReviews.status, 'approved')
                    )
                )
            )
            .orderBy(orderByQuery);

        // Sanitize messages: Only show approved messages, UNLESS it's the current user's own review
        const sanitizedData = data.map(r => ({
            ...r,
            // If user is deleted, replace their name
            userName: r.userName || 'Jilani Home User',
            message: (r.status === 'approved' || r.userId === currentUserId) ? r.message : null,
            isOwnReview: r.userId === currentUserId
        }));

        return { success: true, data: sanitizedData };
    } catch (error) {
        return { success: false, data: [] };
    }
}

export async function checkUserUnlockedProperty(propertyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return false;

        const activeUnlock = await db.select()
            .from(unlocks)
            .where(
                and(
                    eq(unlocks.userId, session.user.id),
                    eq(unlocks.propertyId, propertyId),
                    gte(unlocks.expiresAt, new Date()) // Must not be expired!
                )
            )
            .limit(1);

        return activeUnlock.length > 0;
    } catch (error) {
        return false;
    }
}
