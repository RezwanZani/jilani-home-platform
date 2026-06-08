"use server";

import { db } from "@/lib/db/index";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { normalizePhoneNumber } from "@/lib/utils";

export async function verifyAndRegisterUser(formData: FormData, otp: string) {
    const name = formData.get("name") as string;
    const rawPhone = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const emailInput = formData.get("email") as string;

    if (!name || !rawPhone || !password || !otp) {
        return { error: "All required fields and OTP must be provided." };
    }

    const phoneNumber = normalizePhoneNumber(rawPhone);
    const email = emailInput && emailInput.trim() !== "" ? emailInput.toLowerCase() : null;

    try {
        // 1. CRITICAL: Verify the OTP before doing anything else
        const [tokenRecord] = await db.select().from(verificationTokens).where(
            and(
                eq(verificationTokens.identifier, phoneNumber),
                eq(verificationTokens.token, otp),
                gte(verificationTokens.expires, new Date())
            )
        );

        if (!tokenRecord) {
            return { error: "Invalid or expired OTP code. Please try again." };
        }

        // 2. Delete the token so it cannot be reused (prevent replay attacks)
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, phoneNumber));

        // 3. Check if the phone number is already registered
        const [existingUser] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
        if (existingUser) {
            return { error: "This phone number is already registered." };
        }

        // 4. Securely hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Insert the verified user into the Database
        await db.insert(users).values({
            id: crypto.randomUUID(),
            name,
            phoneNumber,
            email,
            password: hashedPassword,
            role: 'user',
        });

        return { success: true, phoneNumber };
    } catch (err) {
        console.error("Registration Error:", err);
        return { error: "Failed to create account. Please try again." };
    }
}