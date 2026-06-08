"use server";

import { db } from "@/lib/db";
import { zones } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function fetchZones(page: number, limit: number = 10, search = "", sortKey = "createdAt", sortOrder = "asc", filters: any = {}) {
    const offset = (page - 1) * limit;

    try {

        // 1. If a search term exists, search across all relevant columns
        let searchCondition = undefined;
        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            searchCondition = or(
                ilike(zones.name, term),
                ilike(zones.city, term),
                ilike(zones.thana, term),
                ilike(zones.area, term)
            );
        }

        // 2. Advanced Filter Conditions
        const filterConditions = [];

        // Exact or partial match for specific columns based on modal inputs
        if (filters.city) {
            filterConditions.push(ilike(zones.city, `%${filters.city}%`));
        }
        if (filters.thana) {
            filterConditions.push(ilike(zones.thana, `%${filters.thana}%`));
        }
        // Handle boolean status (ensure we don't filter if 'all' is selected or undefined)
        if (filters.isActive !== undefined) {
            filterConditions.push(eq(zones.isActive, filters.isActive));
        }

        // 3. Combine them all using AND
        const finalWhere = and(searchCondition, ...filterConditions);

        // Build Sorting Logic
        let orderByColumn: any;

        if (sortKey === 'name') orderByColumn = zones.name;
        else if (sortKey === 'name_bn') orderByColumn = zones.name_bn;
        else if (sortKey === 'city') orderByColumn = zones.city;
        else if (sortKey === 'city_bn') orderByColumn = zones.city_bn;
        else if (sortKey === 'thana') orderByColumn = zones.thana;
        else if (sortKey === 'thana_bn') orderByColumn = zones.thana_bn;
        else if (sortKey === 'area') orderByColumn = zones.area;
        else if (sortKey === 'area_bn') orderByColumn = zones.area_bn;
        else orderByColumn = zones.name;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        // Fetch Data (Fetch limit + 1 to easily determine if there is a "Next Page")
        const data = await db
            .select()
            .from(zones)
            .where(finalWhere)
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

export async function createZone(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        if (!data.name || !data.name_bn || !data.city || !data.city_bn) {
            return { success: false, error: "Please fill all the required fields." };
        }

        const existingZone = await db.select().from(zones).where(
            eq(zones.name, data.name)
        );

        if (existingZone.length > 0) {
            return { success: false, error: "Zone already exists." };
        }

        const [newZone] = await db.insert(zones).values({
            name: data.name,
            name_bn: data.name_bn,
            city: data.city,
            city_bn: data.city_bn,
            thana: data.thana,
            thana_bn: data.thana_bn,
            area: data.area,
            area_bn: data.area_bn,
            createdAt: new Date(),
        }).returning({ id: zones.id });
        revalidatePath("/admin/zones", "layout");
        return { success: true, zoneId: newZone.id };
    } catch (error: any) {
        console.error("Database Insert Error:", error);
        return { success: false, error: error.message || "Failed to save zone to the database." };
    }
}

export async function bulkInsertZones(parsedData: any[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // 1. Clean and format the data to match your schema
        const formattedZones = parsedData.map((row) => ({
            name: row.name || row.Name,
            name_bn: row.name_bn || row['Name (BN)'],
            city: row.city || row.City || null,
            city_bn: row.city_bn || row['City (BN)'] || null,
            thana: row.thana || row.Thana || null,
            thana_bn: row.thana_bn || row['Thana (BN)'] || null,
            area: row.area || row.Area || null,
            area_bn: row.area_bn || row['Area (BN)'] || null,
            isActive: true, // Default to true
        })).filter(z => z.name && z.name_bn); // Ensure required fields exist

        if (formattedZones.length === 0) {
            return { success: false, error: "No valid rows found. Ensure 'name' and 'name_bn' headers exist." };
        }

        // 2. Bulk Insert (Drizzle handles arrays automatically)
        await db.insert(zones).values(formattedZones);

        // 3. Clear cache to update the UI
        revalidatePath("/admin/zones");

        return { success: true, count: formattedZones.length };
    } catch (error: any) {
        console.error("Bulk upload error:", error);
        return { success: false, error: error.message || "Failed to upload zones." };
    }
}

export async function updateZone(id: number, formData: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        if (!formData.name || !formData.name_bn || !formData.city || !formData.city_bn) {
            return { success: false, error: "Please fill all the required fields." };
        }

        await db.update(zones)
            .set({
                name: formData.name,
                name_bn: formData.name_bn,
                city: formData.city,
                city_bn: formData.city_bn,
                thana: formData.thana,
                thana_bn: formData.thana_bn,
                area: formData.area,
                area_bn: formData.area_bn,
                isActive: true
            })
            .where(eq(zones.id, id));

        revalidatePath("/admin/zones", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Update Error:", error);
        return { success: false, error: error.message || "Failed to update zone." };
    }
}

export async function deleteZone(id: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        await db.delete(zones).where(eq(zones.id, id));

        revalidatePath("/admin/zones", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Database Delete Error:", error);
        return { success: false, error: error.message || "Failed to delete zone." };
    }
}

export async function deleteMultipleZones(ids: number[]) {
    try {
        if (!ids || ids.length === 0) {
            return { success: false, error: "No zones provided for deletion." };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access." };
        }

        if (session.user.role !== "admin") {
            return { success: false, error: "Admin access required." };
        }

        // Ensure all IDs are numbers (TypeScript safety)
        const numericIds = ids.map(id => Number(id));

        // Delete all rows where the ID is inside the numericIds array
        await db.delete(zones).where(inArray(zones.id, numericIds));

        revalidatePath("/admin/zones");
        return { success: true, count: numericIds.length };
    } catch (error: any) {
        return { success: false, error: "Failed to delete selected zones. Some may contain active properties." };
    }
}