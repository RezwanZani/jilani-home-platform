"use server";

import { db } from "@/lib/db";
import { properties, propertyImages, users, ownerContacts, propertyLocationsPrivate, zones } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, inArray, and, isNull } from "drizzle-orm"; // 🚨 Make sure to import this!
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