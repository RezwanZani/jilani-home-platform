"use server";

import { db } from "@/lib/db";
import { promoCodes } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray, and, gte, lte, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function fetchPromoCodes(page: number, limit: number = 10, search = "", sortKey = "code", sortOrder = "desc", filters: any = null) {
    const offset = (page - 1) * limit;

    try {
        const conditions = [];

        if (search.trim() !== "") {
            conditions.push(ilike(promoCodes.code, `%${search.trim()}%`));
        }

        if (filters) {
            if (filters.isActive !== undefined) {
                conditions.push(eq(promoCodes.isActive, filters.isActive));
            }
            if (filters.discountType && filters.discountType !== "all") {
                conditions.push(eq(promoCodes.discountType, filters.discountType));
            }
            if (filters.minAmount) {
                conditions.push(gte(promoCodes.discountValue, filters.minAmount));
            }
            if (filters.maxAmount) {
                conditions.push(lte(promoCodes.discountValue, filters.maxAmount));
            }
            if (filters.validUntil) {
                // To ensure the promo is valid for the ENTIRE requested period,
                // it must expire ON OR AFTER the end of their period (validUntil).
                const checkDate = new Date(filters.validUntil);
                
                // We want to ensure it covers the entire day.
                checkDate.setHours(0, 0, 0, 0); // We just need the promo's validUntil to be >= the start of that day

                conditions.push(
                    or(
                        gte(promoCodes.validUntil, checkDate),
                        isNull(promoCodes.validUntil)
                    )
                );
            }
        }

        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        let orderByColumn: any;
        if (sortKey === 'code') orderByColumn = promoCodes.code;
        else if (sortKey === 'discountType') orderByColumn = promoCodes.discountType;
        else if (sortKey === 'discountValue') orderByColumn = promoCodes.discountValue;
        else if (sortKey === 'maxUses') orderByColumn = promoCodes.maxUses;
        else if (sortKey === 'isActive') orderByColumn = promoCodes.isActive;
        else orderByColumn = promoCodes.code;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        const data = await db
            .select()
            .from(promoCodes)
            .where(finalCondition)
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        const hasMore = data.length > limit;
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function createPromoCode(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        if (!data.code || !data.discountType || !data.discountValue) {
            return { success: false, error: "Please fill all required fields." };
        }

        // Check for duplicate code
        const existingPromo = await db.select().from(promoCodes).where(eq(promoCodes.code, data.code));
        if (existingPromo.length > 0) {
            return { success: false, error: "Promo code already exists." };
        }

        await db.insert(promoCodes).values({
            code: data.code.toUpperCase(),
            discountType: data.discountType, // 'percentage' | 'fixed_amount'
            discountValue: String(data.discountValue),
            maxUses: data.maxUses ? Number(data.maxUses) : null,
            maxUsesPerUser: data.maxUsesPerUser ? Number(data.maxUsesPerUser) : null,
            validUntil: data.validUntil ? new Date(data.validUntil) : null,
            isActive: data.isActive ?? true,
        });

        revalidatePath("/admin/promos", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Insert Error:", error);
        return { success: false, error: error.message || "Failed to save promo code." };
    }
}

export async function updatePromoCode(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        if (!data.code || !data.discountType || !data.discountValue) {
            return { success: false, error: "Please fill all required fields." };
        }

        // Check for duplicate code (excluding current one)
        const existingPromo = await db.select().from(promoCodes).where(eq(promoCodes.code, data.code));
        if (existingPromo.length > 0 && existingPromo[0].id !== id) {
            return { success: false, error: "Promo code already exists." };
        }

        await db.update(promoCodes)
            .set({
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: String(data.discountValue),
                maxUses: data.maxUses ? Number(data.maxUses) : null,
                maxUsesPerUser: data.maxUsesPerUser ? Number(data.maxUsesPerUser) : null,
                validUntil: data.validUntil ? new Date(data.validUntil) : null,
                isActive: data.isActive,
            })
            .where(eq(promoCodes.id, id));

        revalidatePath("/admin/promos", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Update Error:", error);
        return { success: false, error: error.message || "Failed to update promo code." };
    }
}

export async function bulkUpdatePromoStatus(ids: string[], isActive: boolean) {
    try {
        if (!ids || ids.length === 0) return { success: false, error: "No promo codes provided." };

        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(promoCodes)
            .set({ isActive })
            .where(inArray(promoCodes.id, ids));

        revalidatePath("/admin/promos");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to update promo statuses." };
    }
}

export async function validatePromoCode(code: string, userId: string, packagePrice: number) {
    try {
        const promo = await db.query.promoCodes.findFirst({
            where: eq(promoCodes.code, code.toUpperCase())
        });

        if (!promo) {
            return { success: false, error: "Invalid promo code." };
        }

        if (!promo.isActive) {
            return { success: false, error: "Promo code is no longer active." };
        }

        if (promo.validUntil && promo.validUntil < new Date()) {
            return { success: false, error: "Promo code has expired." };
        }

        if (promo.maxUses !== null && promo.timesUsed >= promo.maxUses) {
            return { success: false, error: "Promo code usage limit reached." };
        }

        // Check user specific limit from transactions table
        if (promo.maxUsesPerUser !== null) {
            // Need to query transactions table where userId = userId, promoCodeId = promo.id, and status in ('success', 'pending')
            // Import transactions table at top
            const { transactions } = require("@/lib/db/schema");
            const userTransactions = await db.select().from(transactions).where(
                and(
                    eq(transactions.userId, userId),
                    eq(transactions.promoCodeId, promo.id),
                    or(
                        eq(transactions.status, 'success'),
                        eq(transactions.status, 'pending')
                    )
                )
            );

            if (userTransactions.length >= promo.maxUsesPerUser) {
                return { success: false, error: "You have reached the maximum usage limit for this promo code." };
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (promo.discountType === 'percentage') {
            discountAmount = (packagePrice * Number(promo.discountValue)) / 100;
        } else {
            discountAmount = Number(promo.discountValue);
        }

        // Ensure discount doesn't exceed package price
        if (discountAmount > packagePrice) {
            discountAmount = packagePrice;
        }

        const finalPrice = packagePrice - discountAmount;

        return { 
            success: true, 
            data: {
                promoId: promo.id,
                discountType: promo.discountType,
                discountValue: Number(promo.discountValue),
                discountAmount: Number(discountAmount.toFixed(2)),
                finalPrice: Number(finalPrice.toFixed(2))
            } 
        };
    } catch (error) {
        console.error("Promo validation error:", error);
        return { success: false, error: "Failed to validate promo code." };
    }
}
