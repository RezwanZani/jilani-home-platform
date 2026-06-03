"use server";

import { db } from "@/lib/db";
import { pointPackages } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function fetchPackages(page: number, limit: number = 10, search = "", sortKey = "createdAt", sortOrder = "desc") {
    const offset = (page - 1) * limit;

    try {
        let searchCondition = undefined;
        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            searchCondition = or(
                ilike(pointPackages.name, term),
                ilike(pointPackages.name_bn, term)
            );
        }

        let orderByColumn: any;
        if (sortKey === 'name') orderByColumn = pointPackages.name;
        else if (sortKey === 'points') orderByColumn = pointPackages.points;
        else if (sortKey === 'price') orderByColumn = pointPackages.price;
        else if (sortKey === 'isActive') orderByColumn = pointPackages.isActive;
        else orderByColumn = pointPackages.createdAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        const data = await db
            .select()
            .from(pointPackages)
            .where(searchCondition)
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

export async function createPackage(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        if (!data.name || !data.points || !data.price) {
            return { success: false, error: "Please fill all required fields." };
        }

        await db.insert(pointPackages).values({
            name: data.name,
            name_bn: data.name_bn,
            points: Number(data.points),
            price: String(data.price),
            isActive: data.isActive ?? true,
        });

        revalidatePath("/admin/packages", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Insert Error:", error);
        return { success: false, error: error.message || "Failed to save package." };
    }
}

export async function updatePackage(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        if (!data.name || !data.points || !data.price) {
            return { success: false, error: "Please fill all required fields." };
        }

        await db.update(pointPackages)
            .set({
                name: data.name,
                name_bn: data.name_bn,
                points: Number(data.points),
                price: String(data.price),
                isActive: data.isActive,
            })
            .where(eq(pointPackages.id, id));

        revalidatePath("/admin/packages", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Update Error:", error);
        return { success: false, error: error.message || "Failed to update package." };
    }
}

export async function bulkUpdatePackageStatus(ids: string[], isActive: boolean) {
    try {
        if (!ids || ids.length === 0) return { success: false, error: "No packages provided." };

        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(pointPackages)
            .set({ isActive })
            .where(inArray(pointPackages.id, ids));

        revalidatePath("/admin/packages");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to update package statuses." };
    }
}
