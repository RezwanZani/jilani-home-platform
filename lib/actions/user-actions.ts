"use server";

import { s3Client } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users, savedProperties } from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
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
};

export async function updateProfileInfo(formData: FormData) {
    try {
        //Get the user ID
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        //Get the new name
        const newName = formData.get("name") as string;

        //Validate the name
        if (!newName || newName.trim().length < 2) {
            return { success: false, error: "Name must be at least 2 characters long" }
        }

        //Basic Form Validation

        if (!newName || newName.trim().length < 2) {
            return { success: false, error: "Name must be at least 2 characters long" }
        }

        //Update the name in the database
        await db
            .update(users)
            .set({ name: newName.trim() })
            .where(eq(users.id, session.user.id));

        //Clear the cache so the dashboard updates instantly
        revalidatePath("/dashboard", "layout");

        return { success: true };

    } catch (error) {
        console.error("Update error:", error);
        return { success: false, error: "Failed to update name" };
    }
};

export async function updatePassword(formData: FormData) {
    try {
        //Get The Use
        const session = await auth();

        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        //Validate New Password
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const currentPassword = formData.get("currentPassword") as string;

        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: "Password must be at least 6 characters" }
        }


        const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user?.password) {
            if (!currentPassword) {
                return { success: false, error: "Current password is required" }
            }

            if (newPassword !== confirmPassword) {
                return { success: false, error: "Passwords do not match" }
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user?.password);

            if (!isPasswordValid) {
                return { success: false, error: "Invalid Current password" }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard", "layout");

        return { success: true };


    } catch (error) {
        console.error("Update error:", error);
        return { success: false, error: "Failed to update password" };
    }
}

export async function fetchUsers(
    page: number,
    limit: number = 10,
    search = "",
    sortKey = "createdAt",
    sortOrder = "desc",
    filters: any = {}
) {
    const offset = (page - 1) * limit;

    try {
        let searchCondition = undefined;
        if (search.trim() !== "") {
            const term = `%${search.trim()}%`;
            searchCondition = or(
                ilike(users.name, term),
                ilike(users.email, term),
                ilike(users.phoneNumber, term)
            );
        }

        const filterConditions = [];
        if (filters.role && filters.role !== "all") {
            filterConditions.push(eq(users.role, filters.role));
        }

        // 🚨 IMPORTANT: Always filter out soft-deleted users
        const finalWhere = and(
            isNull(users.deletedAt),
            searchCondition,
            ...filterConditions
        );

        let orderByColumn: any;
        if (sortKey === 'name') orderByColumn = users.name;
        else if (sortKey === 'email') orderByColumn = users.email;
        else if (sortKey === 'pointsBalance') orderByColumn = users.pointsBalance;
        else orderByColumn = users.createdAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        const data = await db
            .select({
                id: users.id,
                name: users.name,
                name_bn: users.name_bn,
                email: users.email,
                phoneNumber: users.phoneNumber,
                role: users.role,
                image: users.image,
                pointsBalance: users.pointsBalance,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(finalWhere)
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        const hasMore = data.length > limit;
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function createUser(formData: any) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Admin access required." };

        // 🚨 SECURITY: Always hash passwords before storing them
        // const hashedPassword = await bcrypt.hash(formData.password, 10);

        await db.insert(users).values({
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password, // REPLACE with hashedPassword in production
            role: formData.role,
            pointsBalance: Number(formData.pointsBalance),
        });

        revalidatePath("/admin/users", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to create user. Email or phone might already exist." };
    }
}

export async function updateUser(id: string, formData: any) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Admin access required." };

        await db.update(users)
            .set({
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: formData.role,
                pointsBalance: Number(formData.pointsBalance),
            })
            .where(eq(users.id, id));

        revalidatePath("/admin/users", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update user." };
    }
}

// 🚨 CHANGED: Soft Delete instead of hard delete
export async function deleteUser(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Admin access required." };

        await db.update(users)
            .set({ deletedAt: new Date() }) // Soft delete
            .where(eq(users.id, id));

        revalidatePath("/admin/users", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete user." };
    }
}

// 🚨 CHANGED: Soft Delete Multiple instead of hard delete
export async function deleteMultipleUsers(ids: string[]) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { success: false, error: "Admin access required." };

        if (!ids || ids.length === 0) return { success: false, error: "No users provided." };

        await db.update(users)
            .set({ deletedAt: new Date() }) // Soft delete
            .where(inArray(users.id, ids));

        revalidatePath("/admin/users");
        return { success: true, count: ids.length };
    } catch (error: any) {
        return { success: false, error: "Failed to delete users." };
    }
}