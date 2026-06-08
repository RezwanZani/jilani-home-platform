import { S3Client } from "@aws-sdk/client-s3";

// 1. Safety check to ensure your .env variables are loaded
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_S3_ENDPOINT) {
    throw new Error("Missing Cloudflare R2 environment variables. Check your .env file.");
}

// 2. Initialize the S3 Client for Cloudflare R2
export const s3Client = new S3Client({
    region: "auto", // Cloudflare R2 always uses "auto" for region
    endpoint: process.env.R2_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});