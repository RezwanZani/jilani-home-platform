"use server";

import { s3Client } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function uploadProfilePicture(formData: FormData) {
    try {
        // 1. Verify user is logged in
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // Fetch the old photo data for deletion
        const [currentUser] = await db
            .select({ image: users.image })
            .from(users)
            .where(eq(users.id, session.user.id));

        const oldImageUrl = currentUser?.image;

        // 2. Extract the file from FormData
        const file = formData.get("profileImage") as File;
        if (!file || file.size === 0) return { success: false, error: "No file provided" };

        // 3. Convert the File to a Node.js Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Compress and format with Sharp
        // This strips EXIF data, crops to a perfect square, and converts to WebP
        const optimizedImageBuffer = await sharp(buffer)
            .resize(500, 500, { fit: "cover" })
            .webp({ quality: 80 })
            .toBuffer();

        // 5. Generate a unique, structured filename
        const fileName = `users/images/${session.user?.id}-${Date.now()}.webp`;

        // 6. Upload to Cloudflare R2
        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: optimizedImageBuffer,
                ContentType: "image/webp",
            })
        );

        // 7. Construct the public URL 
        // (Make sure R2_PUBLIC_DOMAIN is in your .env, e.g., https://pub-xxx.r2.dev)
        const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

        // 8. Update PostgreSQL
        await db.update(users)
            .set({ image: publicUrl })
            .where(eq(users.id, session.user.id));

        // Only attempt delete if it was an R2 link (contains your public domain)
        if (oldImageUrl && oldImageUrl.includes(process.env.R2_PUBLIC_DOMAIN!)) {
            try {
                // Extract the Key (the part after the domain/path)
                const oldKey = oldImageUrl.replace(`${process.env.R2_PUBLIC_DOMAIN}/`, "");

                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: oldKey,
                    })
                );
                console.log(`Deleted old avatar: ${oldKey}`);
            } catch (deleteError) {
                // We log the error but don't fail the whole action if delete fails
                console.error("Failed to delete old image from R2:", deleteError);
            }
        }

        // 9. Clear the cache so the dashboard updates instantly!
        revalidatePath("/dashboard", "layout");

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to upload image" };
    }
}