"use server";

import { db } from "@/lib/db";
import { ownerContacts as owners, properties } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function fetchOwners(page: number, limit: number = 10, search = "", sortKey = "updatedAt", sortOrder = "desc", filters: any = {}) {
    const offset = (page - 1) * limit;

    try {
        // 1. If a search term exists, search across all relevant columns
        let searchCondition = undefined;
        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            searchCondition = or(
                ilike(owners.name, term),
                ilike(owners.name_bn, term),
                ilike(owners.phone, term),
                ilike(owners.whatsapp, term)
            );
        }

        // 2. Advanced Filter Conditions
        const filterConditions = [];

        // Exact or partial match for specific columns based on modal inputs
        if (filters.name) {
            filterConditions.push(ilike(owners.name, `%${filters.name}%`));
        }
        if (filters.phone) {
            filterConditions.push(ilike(owners.phone, `%${filters.phone}%`));
        }

        // 3. Combine them all using AND
        const finalWhere = and(searchCondition, ...filterConditions);

        // Build Sorting Logic
        let orderByColumn: any;

        if (sortKey === 'name') orderByColumn = owners.name;
        else if (sortKey === 'name_bn') orderByColumn = owners.name_bn;
        else if (sortKey === 'phone') orderByColumn = owners.phone;
        else if (sortKey === 'whatsapp') orderByColumn = owners.whatsapp;
        else if (sortKey === 'propertyCount') orderByColumn = sql`count(${properties.id})`;
        else orderByColumn = owners.updatedAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        // Fetch Data (Fetch limit + 1 to easily determine if there is a "Next Page")
        // Fetch Data with Property Count
        const data = await db
            .select({
                // Explicitly select owner fields
                id: owners.id,
                name: owners.name,
                name_bn: owners.name_bn,
                phone: owners.phone,
                whatsapp: owners.whatsapp,
                updatedAt: owners.updatedAt,
                // Create a computed column for the count
                propertyCount: sql<number>`count(${properties.id})`.mapWith(Number),
            })
            .from(owners)
            // Left join properties where the ownerId matches
            .leftJoin(properties, eq(owners.id, properties.ownerId)) // Ensure 'ownerId' matches your actual property schema
            .where(finalWhere)
            .groupBy(owners.id) // Group by owner to get the count per owner
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        // Check if we got that extra item
        const hasMore = data.length > limit;

        // Remove the extra item before sending to the client 
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function createOwner(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        if (!data.name || !data.phone) {
            return { success: false, error: "Please fill all the required fields." };
        }

        // Checking uniqueness by phone number instead of name for contacts
        const existingOwner = await db.select().from(owners).where(
            eq(owners.phone, data.phone)
        );

        if (existingOwner.length > 0) {
            return { success: false, error: "An owner with this phone number already exists." };
        }

        const [newOwner] = await db.insert(owners).values({
            name: data.name,
            name_bn: data.name_bn,
            phone: data.phone,
            whatsapp: data.whatsapp,
        }).returning({ id: owners.id });

        revalidatePath("/admin/owners", "layout");
        return { success: true, ownerId: newOwner.id };
    } catch (error: any) {
        console.error("Database Insert Error:", error);
        return { success: false, error: error.message || "Failed to save owner to the database." };
    }
}

export async function bulkInsertOwners(parsedData: any[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // 1. Clean and format the data to match your schema
        const formattedOwners = parsedData.map((row) => ({
            name: row.name || row.Name,
            name_bn: row.name_bn || row['Name (BN)'] || null,
            phone: String(row.phone || row.Phone || ''),
            whatsapp: row.whatsapp || row.Whatsapp || null,
        })).filter(o => o.name && o.phone); // Ensure required fields exist

        if (formattedOwners.length === 0) {
            return { success: false, error: "No valid rows found. Ensure 'name' and 'phone' headers exist." };
        }

        // 2. Bulk Insert (Drizzle handles arrays automatically)
        await db.insert(owners).values(formattedOwners);

        // 3. Clear cache to update the UI
        revalidatePath("/admin/owners");

        return { success: true, count: formattedOwners.length };
    } catch (error: any) {
        console.error("Bulk upload error:", error);
        return { success: false, error: error.message || "Failed to upload owners." };
    }
}

export async function updateOwner(id: string, formData: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        if (!formData.name || !formData.phone) {
            return { success: false, error: "Please fill all the required fields." };
        }

        await db.update(owners)
            .set({
                name: formData.name,
                name_bn: formData.name_bn,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                // updatedAt is omitted because your schema uses .$onUpdate(() => new Date())
            })
            .where(eq(owners.id, id));

        revalidatePath("/admin/owners", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Update Error:", error);
        return { success: false, error: error.message || "Failed to update owner." };
    }
}

export async function deleteOwner(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        await db.delete(owners).where(eq(owners.id, id));

        revalidatePath("/admin/owners", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Delete Error:", error);
        return { success: false, error: error.message || "Failed to delete owner." };
    }
}

export async function deleteMultipleOwners(ids: string[]) {
    try {
        if (!ids || ids.length === 0) {
            return { success: false, error: "No owners provided for deletion." };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        // Ensure all IDs are strings (TypeScript/UUID safety)
        const stringIds = ids.map(id => String(id));

        // Delete all rows where the ID is inside the stringIds array
        await db.delete(owners).where(inArray(owners.id, stringIds));

        revalidatePath("/admin/owners");
        return { success: true, count: stringIds.length };
    } catch (error: any) {
        return { success: false, error: "Failed to delete selected owners. Some may contain active properties." };
    }
}