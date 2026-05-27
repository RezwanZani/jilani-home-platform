"use server";

import { db } from "@/lib/db";
import { properties, propertyImages, users, ownerContacts, propertyLocationsPrivate } from "@/lib/db/schema";
import { eq } from "drizzle-orm"; // 🚨 Make sure to import this!
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
        return { success: false, error: error.message || "Failed to save property to the database." };
    }
}