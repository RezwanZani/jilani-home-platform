"use server";

import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_S3_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

export async function uploadPropertyImagesToR2(formData: FormData) {
    try {
        const coverFile = formData.get("cover") as File;
        const galleryFiles = formData.getAll("gallery") as File[];

        // Helper function to upload a single file
        const uploadFile = async (file: File, folder: string) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = file.name.split('.').pop();
            const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            }));

            return `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
        };

        // Upload Cover
        let coverUrl: string | null = null;
        if (coverFile) {
            coverUrl = await uploadFile(coverFile, "properties/covers");
        }

        // Upload Gallery in parallel for speed
        let galleryUrls: string[] = [];
        if (galleryFiles && galleryFiles.length > 0) {
            galleryUrls = await Promise.all(
                galleryFiles.map(f => uploadFile(f, "properties/gallery"))
            );
        }

        return { success: true, coverUrl, galleryUrls };
    } catch (error) {
        console.error("R2 Upload Error:", error);
        return { success: false, error: "Failed to upload to Cloudflare R2" };
    }
}

export async function uploadPaymentScreenshot(formData: FormData) {
    try {
        const file = formData.get("screenshot") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop();
        const fileName = `transactions/screenshots/${crypto.randomUUID()}.${ext}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        }));

        const url = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
        return { success: true, url };
    } catch (error) {
        console.error("R2 Screenshot Upload Error:", error);
        return { success: false, error: "Failed to upload screenshot" };
    }
}

export async function deleteFilesFromR2(urls: string[]) {
    try {
        if (!urls || urls.length === 0) return { success: true };
        
        const objectsToDelete = urls.map(url => {
            const urlObj = new URL(url);
            // URL pathname starts with '/', we need to remove it to get the key
            const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
            return { Key: key };
        });

        await s3Client.send(new DeleteObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Delete: { Objects: objectsToDelete }
        }));

        return { success: true };
    } catch (error) {
        console.error("R2 Delete Error:", error);
        return { success: false, error: "Failed to delete from Cloudflare R2" };
    }
}

export async function getPresignedR2Url(fileName: string, fileType: string) {
    try {
        const ext = fileName.split('.').pop() || 'bin';
        const key = `tickets/attachments/${crypto.randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: fileType,
        });

        // 3600 seconds = 1 hour expiration
        // @ts-ignore - mismatch between S3Client types across aws-sdk packages
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const finalUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

        return { success: true, uploadUrl: url, finalUrl };
    } catch (error) {
        console.error("R2 Presigned URL Error:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}