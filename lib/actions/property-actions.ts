"use server";

import { db } from "@/lib/db";
import { properties, propertyImages, users, ownerContacts, propertyLocationsPrivate, zones, savedProperties, unlocks } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray, and, isNull, arrayContains, gte, lte, ne, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteFilesFromR2 } from "./uploads";

export async function createProperty(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized access." };

        const cleanPrice = data.price.replace(/,/g, '');
        const sizeSqft = data.sizeSqft ? parseInt(data.sizeSqft, 10) : null;
        const roomCount = parseInt(data.roomCount, 10) || 0;
        const zoneId = parseInt(data.zoneId, 10);

        // 🚨 Database Transaction 
        const newPropertyId = await db.transaction(async (tx) => {

            let finalOwnerId = data.ownerId; // Defaults to existing owner ID

            // ==========================================
            // A. NEW OWNER CREATION LOGIC
            // ==========================================
            if (data.ownerMode === "new") {
                let phone = data.newOwner.phone ? data.newOwner.phone.replace(/\D/g, '') : "";
                if (phone.startsWith('880')) phone = phone.substring(2);
                if (phone.length > 0 && !phone.startsWith('0')) phone = '0' + phone;

                let whatsapp = data.newOwner.whatsapp ? data.newOwner.whatsapp.replace(/\D/g, '') : null;
                if (whatsapp) {
                    if (whatsapp.startsWith('880')) whatsapp = whatsapp.substring(2);
                    if (whatsapp.length > 0 && !whatsapp.startsWith('0')) whatsapp = '0' + whatsapp;
                }

                // 1. Check if contact exists
                const [existingContact] = await tx.select().from(ownerContacts).where(eq(ownerContacts.phone, phone));
                if (existingContact) {
                    throw new Error("An owner with this phone number already exists.");
                }

                // 2. Insert ONLY into owner_contacts
                const [newContact] = await tx.insert(ownerContacts).values({
                    name: data.newOwner.name,
                    name_bn: data.newOwner.name_bn || null,
                    phone: phone,
                    whatsapp: whatsapp,
                }).returning({ id: ownerContacts.id });

                finalOwnerId = newContact.id;
            }

            // ==========================================
            // B. INSERT PROPERTY (Using finalOwnerId)
            // ==========================================
            const [newProp] = await tx.insert(properties).values({
                ownerId: finalOwnerId,
                zoneId: zoneId,
                title: data.title,
                title_bn: data.title_bn || null,
                description: data.description || null,
                description_bn: data.description_bn || null,
                type: data.type,
                price: cleanPrice,
                priceType: data.priceType,
                slug: data.slug,
                sizeSqft: sizeSqft,
                roomCount: roomCount,
                amenities: data.amenities,
                amenities_bn: data.amenities_bn,
                status: data.status,
                coverImage: data.coverImage,
                videoUrl: data.videoUrl || null,
            }).returning({ id: properties.id });

            // ==========================================
            // C. INSERT PRIVATE ADDRESS (PAYWALL DATA)
            // ==========================================
            await tx.insert(propertyLocationsPrivate).values({
                propertyId: newProp.id, // Links directly to the property we just created
                house: data.privateAddress.house || null,
                house_bn: data.privateAddress.house_bn || null,
                road: data.privateAddress.road || null,
                road_bn: data.privateAddress.road_bn || null,
                block: data.privateAddress.block || null,
                block_bn: data.privateAddress.block_bn || null,
                landmark: data.privateAddress.landmark || null,
                landmark_bn: data.privateAddress.landmark_bn || null,
                additionalLine: data.privateAddress.additionalLine || null,
                additionalLine_bn: data.privateAddress.additionalLine_bn || null,
            });

            // D. Insert Gallery Images
            if (data.galleryUrls && data.galleryUrls.length > 0) {
                const imageInsertData = data.galleryUrls.map((url: string) => ({
                    propertyId: newProp.id,
                    imageUrl: url,
                    isPrimary: false,
                }));
                await tx.insert(propertyImages).values(imageInsertData);
            }

            return newProp.id;
        });

        revalidatePath("/admin/properties", "layout");
        return { success: true, propertyId: newPropertyId };

    } catch (error: any) {
        console.error("Database Insert Error:", error);
        if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('slug') && error.message.toLowerCase().includes('unique'))) {
            return { success: false, error: "This slug is already in use. Please choose a unique slug." };
        }
        return { success: false, error: error.message || "Failed to save property to the database." };
    }
}

export async function updateProperty(propertyId: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized access." };

        const cleanPrice = data.price ? data.price.replace(/,/g, '') : null;
        const sizeSqft = data.sizeSqft ? parseInt(data.sizeSqft, 10) : null;
        const roomCount = parseInt(data.roomCount, 10) || 0;
        const zoneId = parseInt(data.zoneId, 10);

        // 🚨 Database Transaction 
        await db.transaction(async (tx) => {

            let finalOwnerId = data.ownerId; // Defaults to existing owner ID

            // ==========================================
            // A. NEW OWNER CREATION LOGIC (If changed during edit)
            // ==========================================
            if (data.ownerMode === "new") {
                const phone = data.newOwner.phone.trim();

                // 1. Check if contact exists
                const [existingContact] = await tx.select().from(ownerContacts).where(eq(ownerContacts.phone, phone));
                if (existingContact) {
                    throw new Error("An owner with this phone number already exists.");
                }

                // 2. Insert ONLY into owner_contacts
                const [newContact] = await tx.insert(ownerContacts).values({
                    name: data.newOwner.name,
                    name_bn: data.newOwner.name_bn || null,
                    phone: phone,
                    whatsapp: data.newOwner.whatsapp || null,
                }).returning({ id: ownerContacts.id });

                finalOwnerId = newContact.id;
            }

            // ==========================================
            // B. UPDATE PROPERTY
            // ==========================================
            // We conditionally spread coverImage so we don't overwrite it if the user didn't upload a new one
            await tx.update(properties).set({
                ownerId: finalOwnerId,
                zoneId: zoneId,
                title: data.title,
                title_bn: data.title_bn || null,
                description: data.description || null,
                description_bn: data.description_bn || null,
                type: data.type,
                price: cleanPrice,
                priceType: data.priceType,
                slug: data.slug,
                sizeSqft: sizeSqft,
                roomCount: roomCount,
                amenities: data.amenities,
                amenities_bn: data.amenities_bn,
                status: data.status,
                coverImage: data.coverImage || null,
                videoUrl: data.videoUrl || null,
            }).where(eq(properties.id, propertyId));

            // ==========================================
            // C. UPDATE PRIVATE ADDRESS (UPSERT)
            // ==========================================
            // Uses insert + onConflictDoUpdate to ensure it safely updates, 
            // or creates the row if it was missing for some reason.
            await tx.insert(propertyLocationsPrivate).values({
                propertyId: propertyId,
                house: data.privateAddress?.house || null,
                house_bn: data.privateAddress?.house_bn || null,
                road: data.privateAddress?.road || null,
                road_bn: data.privateAddress?.road_bn || null,
                block: data.privateAddress?.block || null,
                block_bn: data.privateAddress?.block_bn || null,
                landmark: data.privateAddress?.landmark || null,
                landmark_bn: data.privateAddress?.landmark_bn || null,
            }).onConflictDoUpdate({
                target: propertyLocationsPrivate.propertyId,
                set: {
                    house: data.privateAddress?.house || null,
                    house_bn: data.privateAddress?.house_bn || null,
                    road: data.privateAddress?.road || null,
                    road_bn: data.privateAddress?.road_bn || null,
                    block: data.privateAddress?.block || null,
                    block_bn: data.privateAddress?.block_bn || null,
                    landmark: data.privateAddress?.landmark || null,
                    landmark_bn: data.privateAddress?.landmark_bn || null,
                    additionalLine: data.privateAddress?.additionalLine || null,
                    additionalLine_bn: data.privateAddress?.additionalLine_bn || null,
                }
            });

            // ==========================================
            // D. APPEND NEW GALLERY IMAGES
            // ==========================================
            // Assumes data.galleryUrls only contains newly uploaded R2 image URLs
            if (data.galleryUrls && data.galleryUrls.length > 0) {
                const imageInsertData = data.galleryUrls.map((url: string) => ({
                    propertyId: propertyId,
                    imageUrl: url,
                    isPrimary: false,
                }));
                await tx.insert(propertyImages).values(imageInsertData);
            }

            // ==========================================
            // E. HANDLE DELETED IMAGES
            // ==========================================
            if (data.deletedImageUrls && data.deletedImageUrls.length > 0) {
                await tx.delete(propertyImages).where(inArray(propertyImages.imageUrl, data.deletedImageUrls));
            }
        });

        if (data.deletedImageUrls && data.deletedImageUrls.length > 0) {
            await deleteFilesFromR2(data.deletedImageUrls);
        }

        revalidatePath("/admin/properties", "layout");
        return { success: true };

    } catch (error: any) {
        console.error("Database Update Error:", error);
        if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('slug') && error.message.toLowerCase().includes('unique'))) {
            return { success: false, error: "This slug is already in use. Please choose a unique slug." };
        }
        return { success: false, error: error.message || "Failed to update property in the database." };
    }
}

export async function fetchProperties(page: number, limit: number = 10, search = "", sortKey = "createdAt", sortOrder = "desc", filters: any = {}) {
    const offset = (page - 1) * limit;
    try {
        let searchCondition = undefined;
        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            searchCondition = or(
                ilike(properties.title, term),
                ilike(properties.title_bn, term)
            );
        }

        const filterConditions = [];
        if (filters.type && filters.type !== "all") filterConditions.push(eq(properties.type, filters.type));
        if (filters.status && filters.status !== "all") filterConditions.push(eq(properties.status, filters.status));

        const finalWhere = and(isNull(properties.deletedAt), searchCondition, ...filterConditions);

        let orderByColumn: any;
        if (sortKey === 'title') orderByColumn = properties.title;
        else if (sortKey === 'price') orderByColumn = properties.price;
        else if (sortKey === 'viewsCount') orderByColumn = properties.viewsCount;
        else if (sortKey === 'rating') orderByColumn = properties.averageRating;
        else if (sortKey === 'reviews') orderByColumn = properties.totalReviews;
        else orderByColumn = properties.createdAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        // Fetch properties with related owner and zone names
        const data = await db
            .select({
                id: properties.id,
                title: properties.title,
                type: properties.type,
                price: properties.price,
                priceType: properties.priceType,
                roomCount: properties.roomCount,
                sizeSqft: properties.sizeSqft,
                status: properties.status,
                coverImage: properties.coverImage,
                viewsCount: properties.viewsCount, // 🚨 Added Views Count
                averageRating: properties.averageRating,
                totalReviews: properties.totalReviews,
                createdAt: properties.createdAt,
                ownerId: properties.ownerId, // 🚨 Added to pass into the Edit Form
                zoneId: properties.zoneId,   // 🚨 Added to pass into the Edit Form
                ownerName: ownerContacts.name,
                ownerPhone: ownerContacts.phone,
                zoneName: zones.name,
                zoneCity: zones.city,
            })
            .from(properties)
            .leftJoin(ownerContacts, eq(properties.ownerId, ownerContacts.id))
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .where(finalWhere)
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        const hasMore = data.length > limit;
        return { data: hasMore ? data.slice(0, -1) : data, hasMore };
    } catch (error) {
        throw new Error("Failed to fetch properties");
    }
}

export async function fetchPropertyById(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized access." };

        const [property] = await db.select().from(properties).where(eq(properties.id, id));
        if (!property) return { success: false, error: "Property not found" };

        const [location] = await db.select().from(propertyLocationsPrivate).where(eq(propertyLocationsPrivate.propertyId, id));

        const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id));
        const galleryUrls = images.map(i => i.imageUrl);

        const [owner] = await db.select().from(ownerContacts).where(eq(ownerContacts.id, property.ownerId));

        return {
            success: true,
            data: {
                ...property,
                location: location || null,
                galleryUrls: galleryUrls,
                ownerName: owner?.name,
                ownerPhone: owner?.phone,
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProperty(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Unauthorized." };

        await db.update(properties).set({ deletedAt: new Date() }).where(eq(properties.id, id));
        revalidatePath("/admin/properties");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMultipleProperties(ids: string[]) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Unauthorized." };

        if (!ids || ids.length === 0) return { success: false, error: "No properties provided." };
        await db.update(properties).set({ deletedAt: new Date() }).where(inArray(properties.id, ids));
        revalidatePath("/admin/properties");
        return { success: true, count: ids.length };
    } catch (error: any) {
        return { success: false, error: "Failed to delete properties." };
    }
}

// ==========================================
// BULK UPLOAD ENGINE
// ==========================================
export async function bulkProcessProperties(rows: any[]) {
    const session = await auth();
    if (session?.user?.role !== "admin") return { success: false, error: "Unauthorized." };

    const processedRows = [];
    let successCount = 0;

    for (const row of rows) {
        const resultRow = { ...row }; // Copy row to append status later
        try {
            // --- 1. RESOLVE ZONE ---
            let finalZoneId = null;
            if (row['Zone ID']) {
                const parsedZoneId = Number(row['Zone ID']);
                if (!isNaN(parsedZoneId)) {
                    const z = await db.select().from(zones).where(eq(zones.id, parsedZoneId)).limit(1);
                    if (z.length > 0) finalZoneId = z[0].id;
                }
            }
            if (!finalZoneId && row['Zone Name (EN)']) {
                const z = await db.select().from(zones).where(ilike(zones.name, row['Zone Name (EN)'])).limit(1);
                if (z.length > 0) finalZoneId = z[0].id;
            }
            if (!finalZoneId) {
                if (!row['Zone Name (EN)'] || !row['Zone Name (BN)']) throw new Error("Missing Zone details to create a new one.");
                const [newZone] = await db.insert(zones).values({
                    name: row['Zone Name (EN)'],
                    name_bn: row['Zone Name (BN)'],
                    city: row['City'] || null,
                    thana: row['Thana'] || null,
                    area: row['Area'] || null,
                }).returning({ id: zones.id });
                finalZoneId = newZone.id;
            }

            // --- 2. RESOLVE OWNER ---
            let finalOwnerId = null;
            if (row['Owner ID']) {
                // Ensure it's a valid UUID before querying to prevent Postgres crash
                const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(row['Owner ID']));
                if (isValidUUID) {
                    const o = await db.select().from(ownerContacts).where(eq(ownerContacts.id, row['Owner ID'])).limit(1);
                    if (o.length > 0) finalOwnerId = o[0].id;
                }
            }

            // Format phone number to 11-digit BD standard to ensure consistent lookup and creation
            let formattedPhone = row['Owner Phone'] ? String(row['Owner Phone']).replace(/\D/g, '') : "";
            if (formattedPhone.startsWith('880')) formattedPhone = formattedPhone.substring(2);
            if (formattedPhone.length > 0 && !formattedPhone.startsWith('0')) formattedPhone = '0' + formattedPhone;

            let formattedWhatsApp = row['Owner WhatsApp'] ? String(row['Owner WhatsApp']).replace(/\D/g, '') : null;
            if (formattedWhatsApp) {
                if (formattedWhatsApp.startsWith('880')) formattedWhatsApp = formattedWhatsApp.substring(2);
                if (formattedWhatsApp.length > 0 && !formattedWhatsApp.startsWith('0')) formattedWhatsApp = '0' + formattedWhatsApp;
            }

            if (!finalOwnerId && formattedPhone) {
                const o = await db.select().from(ownerContacts).where(eq(ownerContacts.phone, formattedPhone)).limit(1);
                if (o.length > 0) finalOwnerId = o[0].id;
            }
            if (!finalOwnerId) {
                if (!row['Owner Name (EN)'] || !formattedPhone) throw new Error("Missing Owner Name or Phone to create a new one.");
                const [newOwner] = await db.insert(ownerContacts).values({
                    name: row['Owner Name (EN)'],
                    name_bn: row['Owner Name (BN)'] || null,
                    phone: formattedPhone,
                    whatsapp: formattedWhatsApp,
                }).returning({ id: ownerContacts.id });
                finalOwnerId = newOwner.id;
            }

            // --- 3. INSERT PROPERTY ---
            // Validate ENUMS to prevent database crashes
            const validTypes = ['house', 'office', 'hall', 'apartment', 'studio', 'penthouse', 'villa', 'commercial'];
            const pTypeRaw = row['Type'] ? String(row['Type']).toLowerCase() : '';
            if (!validTypes.includes(pTypeRaw)) {
                throw new Error(`Invalid Property Type: "${row['Type']}". Must be one of: ${validTypes.join(', ')}`);
            }

            const validPriceTypes = ['hour', 'month', 'day', 'year', 'event', 'one-time'];
            let pPriceType = row['Price Type'] ? String(row['Price Type']).toLowerCase() : 'month';
            if (!validPriceTypes.includes(pPriceType)) pPriceType = 'month';

            const baseSlug = String(row['Title (EN)']).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const uniqueSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

            await db.insert(properties).values({
                zoneId: finalZoneId,
                ownerId: finalOwnerId,
                title: row['Title (EN)'],
                title_bn: row['Title (BN)'] ? String(row['Title (BN)']) : null,
                slug: uniqueSlug,
                description: row['Description (EN)'] ? String(row['Description (EN)']) : null,
                description_bn: row['Description (BN)'] ? String(row['Description (BN)']) : null,
                type: pTypeRaw as any,
                price: String(row['Price']),
                priceType: pPriceType as any,
                sizeSqft: row['Size (Sqft)'] ? Number(row['Size (Sqft)']) : null,
                roomCount: Number(row['Rooms']),
                status: 'pending', // Default
            });

            // Retrieve the property we just inserted to get its ID
            const insertedProp = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, uniqueSlug)).limit(1);
            if (insertedProp.length > 0) {
                // Check if any private address field is provided
                const hasPrivateAddress = row['House/Flat (EN)'] || row['House/Flat (BN)'] || row['Road (EN)'] || row['Road (BN)'] || row['Block (EN)'] || row['Block (BN)'] || row['Landmark (EN)'] || row['Landmark (BN)'] || row['Additional Line (EN)'] || row['Additional Line (BN)'];

                if (hasPrivateAddress) {
                    await db.insert(propertyLocationsPrivate).values({
                        propertyId: insertedProp[0].id,
                        house: row['House/Flat (EN)'] ? String(row['House/Flat (EN)']) : null,
                        house_bn: row['House/Flat (BN)'] ? String(row['House/Flat (BN)']) : null,
                        road: row['Road (EN)'] ? String(row['Road (EN)']) : null,
                        road_bn: row['Road (BN)'] ? String(row['Road (BN)']) : null,
                        block: row['Block (EN)'] ? String(row['Block (EN)']) : null,
                        block_bn: row['Block (BN)'] ? String(row['Block (BN)']) : null,
                        landmark: row['Landmark (EN)'] ? String(row['Landmark (EN)']) : null,
                        landmark_bn: row['Landmark (BN)'] ? String(row['Landmark (BN)']) : null,
                        additionalLine: row['Additional Line (EN)'] ? String(row['Additional Line (EN)']) : null,
                        additionalLine_bn: row['Additional Line (BN)'] ? String(row['Additional Line (BN)']) : null,
                    });
                }
            }

            resultRow.Status = "Succeed";
            resultRow.Remark = "Added successfully";
            successCount++;
        } catch (error: any) {
            resultRow.Status = "Failed";
            resultRow.Remark = error.message;
        }
        processedRows.push(resultRow);
    }

    revalidatePath("/admin/properties");
    return { success: true, processedRows, successCount };
}

export async function bulkUpdatePropertyStatus(ids: string[], newStatus: 'pending' | 'active' | 'inactive' | 'expired') {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Unauthorized." };

        if (!ids || ids.length === 0) return { success: false, error: "No properties provided." };

        await db.update(properties)
            .set({ status: newStatus })
            .where(inArray(properties.id, ids));

        revalidatePath("/admin/properties");
        return { success: true, count: ids.length };
    } catch (error: any) {
        return { success: false, error: "Failed to update statuses." };
    }
}

//==========================================
// Homepage Featured Property Section
//==========================================
export async function getTopRatedProperties() {
    try {
        //Get the user
        const session = await auth();
        const userId = session?.user?.id;

        //Safely create the join condition for saved properties
        const savedJoinCondition = userId
            ? and(
                eq(savedProperties.propertyId, properties.id),
                eq(savedProperties.userId, userId)
            )
            : sql`FALSE`;

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
                savedId: savedProperties.id,
                unlockedId: unlocks.id
            })
            .from(properties)
            // 2. Join the zones table where the IDs match
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .leftJoin(savedProperties, savedJoinCondition)
            .leftJoin(unlocks, unlockJoinCondition)
            .where(eq(properties.status, 'active'))
            .orderBy(desc(properties.averageRating))
            .limit(10);

        return { success: true, data };
    } catch (error) {
        console.error("Database error fetching top properties:", error);
        return { success: false, data: [] };
    }
}

//===========================================
// LISTING PAGE QUERYING
//===========================================
// 1. Fetch distinct cities for the filter sidebar
export async function getAvailableCities() {
    try {
        // Fetch unique cities that have active properties
        const data = await db
            .select({ city: zones.city })
            .from(properties)
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .where(eq(properties.status, 'active'))
            .groupBy(zones.city);

        return { success: true, data: data.map(d => d.city).filter(Boolean) as string[] };
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        return { success: false, data: [] as string[] };
    }
}

// 2. The new heavily optimized, paginated query
export async function getPaginatedProperties(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    city?: string;
    minRooms?: number;
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
    amenities?: string[];
    sortBy?: string;
}) {
    const { page, limit, search, type, city, minRooms, minPrice, maxPrice, priceType, amenities, sortBy } = params;
    const offset = (page - 1) * limit;

    try {
        // Get current user
        const session = await auth();
        const userId = session?.user?.id;

        const conditions: any[] = [eq(properties.status, 'active')];

        // Search Match
        if (search) {
            conditions.push(
                or(
                    ilike(properties.title, `%${search}%`),
                    ilike(zones.city, `%${search}%`),
                    ilike(zones.name, `%${search}%`)
                )
            );
        }

        // Room Count Filter
        if (minRooms && minRooms > 0) {
            conditions.push(gte(properties.roomCount, minRooms));
        }

        // FIX 1: Exact Category Type Filter (Handle Enums correctly)
        if (type && type !== 'All') {
            // Convert "Office" to "office" to match the database enum strictly
            let dbType = type.toLowerCase();
            // Fallback mapper just in case the UI ever sends "Commercial Space"
            if (dbType === 'commercial space') dbType = 'commercial';

            conditions.push(eq(properties.type, dbType as any));
        }

        // Exact City Filter
        if (city && city !== 'All Cities') {
            conditions.push(eq(zones.city, city));
        }

        // Price Type Filter
        if (priceType && priceType !== 'All') {
            conditions.push(eq(properties.priceType, priceType as any));
        }

        // Price Min/Max Filter
        if (minPrice && minPrice > 0) {
            conditions.push(sql`${properties.price}::numeric >= ${minPrice}`);
        }
        if (maxPrice && maxPrice > 0) {
            conditions.push(sql`${properties.price}::numeric <= ${maxPrice}`);
        }

        // FIX 2: Amenities Filter for JSONB column
        if (amenities && amenities.length > 0) {
            // Use PostgreSQL JSONB containment operator `@>`
            // This checks if the database JSON array contains all elements of the provided JSON array
            conditions.push(sql`${properties.amenities} @> ${JSON.stringify(amenities)}::jsonb`);
        }

        // Sorting
        let orderBy: any = desc(properties.createdAt);
        if (sortBy === 'Top Rated') orderBy = desc(properties.averageRating);
        else if (sortBy === 'Price: Low to High') orderBy = asc(sql`${properties.price}::numeric`);
        else if (sortBy === 'Price: High to Low') orderBy = desc(sql`${properties.price}::numeric`);

        // Safely create the join condition for saved properties
        const savedJoinCondition = userId
            ? and(
                eq(savedProperties.propertyId, properties.id),
                eq(savedProperties.userId, userId)
            )
            : sql`FALSE`;

        // Create the Unlock Join Condition
        const unlockJoinCondition = userId
            ? and(
                eq(unlocks.propertyId, properties.id),
                eq(unlocks.userId, userId),
                gte(unlocks.expiresAt, new Date()) // Must be active!
            )
            : sql`FALSE`;

        const data = await db
            .select({
                property: properties,
                zone: { id: zones.id, name: zones.name, city: zones.city },
                // If savedId is not null, the user has saved this property
                savedId: savedProperties.id,
                unlockedId: unlocks.id
            })
            .from(properties)
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .leftJoin(savedProperties, savedJoinCondition)
            .leftJoin(unlocks, unlockJoinCondition)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return { success: true, data };
    } catch (error) {
        console.error("Database error fetching paginated properties:", error);
        return { success: false, data: [] };
    }
}


//==========================================
//      INDIVIDUAL PROPERTY QUERY
//==========================================
export async function getPropertyBySlug(slug: string) {
    try {
        // 1. Fetch the main property and zone
        const data = await db
            .select({
                property: properties,
                zone: {
                    id: zones.id,
                    name: zones.name,
                    city: zones.city,
                    thana: zones.thana,
                    area: zones.area,
                }
            })
            .from(properties)
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .where(eq(properties.slug, slug))
            .limit(1);

        if (data.length === 0) {
            return { success: true, data: null };
        }

        const result = data[0];

        // 2. Fetch the images for this specific property
        const imagesData = await db
            .select({ url: propertyImages.imageUrl })
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, result.property.id));

        const imageUrls = imagesData.map(img => img.url);

        // 3. CHECK ACTIVE UNLOCK STATUS
        const session = await auth();
        const userId = session?.user?.id;

        let hasActiveUnlock = false;
        let ownerData = null;
        let exactAddress = null;

        if (userId) {
            const unlockCheck = await db.select().from(unlocks).where(
                and(
                    eq(unlocks.userId, userId),
                    eq(unlocks.propertyId, result.property.id),
                    gte(unlocks.expiresAt, new Date()) // Ensure it hasn't expired!
                )
            ).limit(1);

            if (unlockCheck.length > 0) hasActiveUnlock = true;
        }

        // 4. SECURELY FETCH OWNER & PRIVATE LOCATION DATA (Only if unlocked)
        if (hasActiveUnlock) {
            const owner = await db.select().from(ownerContacts).where(eq(ownerContacts.id, result.property.ownerId)).limit(1);
            ownerData = owner[0] || null;

            const privLoc = await db.select().from(propertyLocationsPrivate).where(eq(propertyLocationsPrivate.propertyId, result.property.id)).limit(1);
            if (privLoc.length > 0) exactAddress = privLoc[0]; // Grab the whole object
        }

        return {
            success: true,
            data: {
                property: { ...result.property, images: imageUrls },
                zone: result.zone,

                // NEW: Send the structured detailed data, completely excluding email
                protectedContact: hasActiveUnlock ? {
                    ownerName: ownerData?.name || "N/A",
                    phone: ownerData?.phone || "N/A",
                    whatsapp: ownerData?.whatsapp || "Not Provided",
                    house: exactAddress?.house || "",
                    road: exactAddress?.road || "",
                    block: exactAddress?.block || "",
                    landmark: exactAddress?.landmark || "",
                    additionalLine: exactAddress?.additionalLine || "",
                } : null,

                hasUnlocked: hasActiveUnlock
            }
        };
    } catch (error) {
        console.error("Database error fetching property by Slug:", error);
        return { success: false, data: null };
    }
}

export async function getSimilarProperties(type: string, currentId: string) {
    try {
        const data = await db
            .select({
                property: properties,
                zone: {
                    id: zones.id,
                    name: zones.name,
                    city: zones.city,
                }
            })
            .from(properties)
            .leftJoin(zones, eq(properties.zoneId, zones.id))
            .where(
                and(
                    eq(properties.status, 'active'),
                    eq(properties.type, type as any),
                    // Exclude the currently viewed property
                    ne(properties.id, currentId)
                )
            )
            .orderBy(desc(properties.createdAt))
            .limit(3);

        return { success: true, data };
    } catch (error) {
        console.error("Database error fetching similar properties:", error);
        return { success: false, data: [] };
    }
}