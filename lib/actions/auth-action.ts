"use server";

import { db } from "@/lib/db/index";
import { auth } from "@/lib/auth";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function sendPhoneOTP(phoneNumber: string) {
    try {
        // 1. Generate a random 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Set expiration time to exactly 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 3. Clear any existing OTPs for this phone number to prevent conflicts
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, phoneNumber));

        // 4. Save the new OTP to your database
        await db.insert(verificationTokens).values({
            identifier: phoneNumber,
            token: otpCode,
            expires: expiresAt,
        });

        // 5. The Delivery (Mock Strategy for Development vs Production)
        if (process.env.NODE_ENV === "development") {
            // In development, we DO NOT send a real SMS to save money[cite: 456, 457].
            console.log(`\n=============================`);
            console.log(`🚀 MOCK SMS SENT!`);
            console.log(`📱 To: ${phoneNumber}`);
            console.log(`🔑 Code: ${otpCode}`);
            console.log(`=============================\n`);
        } else {
            const SMSNOC_API_URL = "https://api.smsnoc.com/v3/sms/send";
            const SMSNOC_API_TOKEN = process.env.SMSNOC_API_TOKEN;

            const response = await fetch(SMSNOC_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${SMSNOC_API_TOKEN}`,
                },
                body: JSON.stringify({
                    recipient: phoneNumber,
                    message: `Your Jilani Home login code is ${otpCode}. It expires in 5 minutes.`,
                    // sender_id: "JilaniHome" // Add this if you get a Masking ID later
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send SMS via gateway.");
            }
        }

        return { success: true, message: "OTP sent successfully." };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP. Please try again." };
    }
}

export async function verifyAndSavePhoneOTP(phoneNumber: string, otp: string) {
    try {
        // 1. Ensure the user is currently logged in (e.g., via Google)
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized. Please log in first." };
        }

        // 2. Normalize the phone number (removes +88, spaces, etc.)
        // You should use the normalizeIdentifier function we discussed earlier here
        const normalizedPhone = phoneNumber.replace(/[\s\-()+]/g, '');

        // 3. Verify the OTP exists and is not expired
        const [tokenRecord] = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, normalizedPhone),
                    eq(verificationTokens.token, otp),
                    gte(verificationTokens.expires, new Date())
                )
            );

        if (!tokenRecord) {
            return { success: false, message: "Invalid or expired OTP code." };
        }

        // 4. Delete the token so it cannot be reused (Prevent replay attacks)
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, normalizedPhone));

        // 5. Check if this phone number is already attached to ANOTHER account
        const [existingPhone] = await db
            .select()
            .from(users)
            .where(eq(users.phoneNumber, normalizedPhone));

        if (existingPhone && existingPhone.id !== session.user.id) {
            return { success: false, message: "This phone number is already registered to another account." };
        }

        // 6. Update the current user's record with the new phone number
        await db
            .update(users)
            .set({ phoneNumber: normalizedPhone })
            .where(eq(users.id, session.user.id));

        // 1. Tell Next.js to clear its server cache so it reads the fresh database data
        revalidatePath("/", "layout");

        return { success: true, message: "Phone number verified successfully!" };
    } catch (error) {
        console.error("Error verifying onboarding OTP:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }

    // 2. Trigger a hard server-side redirect to the dashboard
    // (Note: redirect() must be called OUTSIDE the try/catch block in Next.js)
    redirect("/dashboard");
}