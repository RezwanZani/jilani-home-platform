"use server";

import { db } from "@/lib/db/index";
import { auth } from "@/lib/auth";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function sendPhoneOTP(phoneNumber: string) {
    try {

        if (!phoneNumber || phoneNumber.length !== 11) {
            return { success: false, message: "Please provide a valid 11 digit phone number." };
        }

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

        if (!phoneNumber || !otp) {
            return { success: false, message: "Please provide phone number and OTP." };
        }

        // 2. Normalize the phone number (removes +88, spaces, etc.)
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

export async function verifyAndUpdatePhone(newPhone: string, otp: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized. Please log in first." };
        }

        if (!newPhone || !otp) {
            return { success: false, message: "Please provide the new phone number and OTP." };
        }

        // 1. Normalize the new phone number
        const normalizedPhone = newPhone.replace(/[\s\-()+]/g, '');

        // 2. Verify the OTP exists and is not expired
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

        // 3. Delete the token to prevent reuse
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, normalizedPhone));

        // 4. Check if the new phone number is already taken by someone else
        const [existingPhone] = await db
            .select()
            .from(users)
            .where(eq(users.phoneNumber, normalizedPhone));

        if (existingPhone && existingPhone.id !== session.user.id) {
            return { success: false, message: "This phone number is already registered to another account." };
        }

        // 5. Update the current user's record
        await db
            .update(users)
            .set({ phoneNumber: normalizedPhone })
            .where(eq(users.id, session.user.id));

        // 6. Clear cache so the dashboard immediately shows the new number
        revalidatePath("/dashboard", "layout");

        return { success: true, message: "Phone number updated successfully!" };
    } catch (error) {
        console.error("Error updating phone number:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
}

export async function sendEmailOTP(email: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized. Please log in first." };
        }

        if (!email || !email.includes("@")) {
            return { success: false, message: "Please provide a valid email address." };
        }

        // 1. Generate a random 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Set expiration time to exactly 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 3. Clear any existing OTPs for this phone number to prevent conflicts
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, email));

        // 4. Save the new OTP to your database
        await db.insert(verificationTokens).values({
            identifier: email,
            token: otpCode,
            expires: expiresAt,
        });

        // 5. The Delivery (Mock Strategy for Development vs Production)
        if (process.env.NODE_ENV === "development") {
            // In development, we DO NOT send a real SMS to save money[cite: 456, 457].
            console.log(`\n=============================`);
            console.log(`🚀 MOCK SMS SENT!`);
            console.log(`📱 To: ${email}`);
            console.log(`🔑 Code: ${otpCode}`);
            console.log(`=============================\n`);
        } else {
            const EMAIL_API_URL = "https://api.emailnoc.com/v3/sms/send";
            const EMAIL_API_TOKEN = process.env.EMAIL_API_TOKEN;

            const response = await fetch(EMAIL_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${EMAIL_API_TOKEN}`,
                },
                body: JSON.stringify({
                    to: email,
                    subject: "Jilani Home",
                    body: `Your Jilani Home verification code is ${otpCode}. It expires in 5 minutes.`,
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

export async function verifyAndUpdateEmail(email: string, otp: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized. Please log in first." };
        }

        if (!email || !otp) {
            return { success: false, message: "Please provide the new email and OTP." };
        }

        // 1. Normalize the new email
        const normalizedEmail = email;

        // 2. Verify the OTP exists and is not expired
        const [tokenRecord] = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, normalizedEmail),
                    eq(verificationTokens.token, otp),
                    gte(verificationTokens.expires, new Date())
                )
            );

        if (!tokenRecord) {
            return { success: false, message: "Invalid or expired OTP code." };
        }

        // 3. Delete the token to prevent reuse
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, normalizedEmail));

        // 4. Check if the new email is already taken by someone else
        const [existingEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail));

        if (existingEmail && existingEmail.id !== session.user.id) {
            return { success: false, message: "This email is already registered to another account." };
        }

        // 5. Update the current user's record
        await db
            .update(users)
            .set({ email: normalizedEmail })
            .where(eq(users.id, session.user.id));

        // 6. Clear cache so the dashboard immediately shows the new number
        revalidatePath("/dashboard", "layout");

        return { success: true, message: "Email updated successfully!" };
    } catch (error) {
        console.error("Error updating email:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
}

export async function sendForgotPasswordOTP(identifier: string) {
    try {
        if (!identifier) {
            return { success: false, message: "Please provide an email or phone number." };
        }

        let normalizedIdentifier = identifier.trim();
        const isEmail = identifier.includes("@");
        
        if (!isEmail) {
            normalizedIdentifier = identifier.replace(/[\s\-()+]/g, '');
            if (normalizedIdentifier.length !== 11) {
                return { success: false, message: "Please provide a valid email or 11 digit phone number." };
            }
        }

        // 1. Check if user exists
        let userExists;
        if (isEmail) {
            [userExists] = await db.select().from(users).where(eq(users.email, normalizedIdentifier));
        } else {
            [userExists] = await db.select().from(users).where(eq(users.phoneNumber, normalizedIdentifier));
        }

        if (!userExists) {
            // Return success anyway to prevent enumeration attacks, but don't actually send OTP
            // Actually, for user experience in this app, maybe we want to tell them.
            return { success: false, message: "No account found with this information." };
        }

        // 2. Generate a random 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Set expiration time to exactly 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 4. Clear any existing OTPs
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, normalizedIdentifier));

        // 5. Save the new OTP
        await db.insert(verificationTokens).values({
            identifier: normalizedIdentifier,
            token: otpCode,
            expires: expiresAt,
        });

        // 6. The Delivery
        if (process.env.NODE_ENV === "development") {
            console.log(`\n=============================`);
            console.log(`🚀 MOCK OTP SENT FOR PASSWORD RESET!`);
            console.log(`📱 To: ${normalizedIdentifier}`);
            console.log(`🔑 Code: ${otpCode}`);
            console.log(`=============================\n`);
        } else {
            if (isEmail) {
                const EMAIL_API_URL = "https://api.emailnoc.com/v3/sms/send";
                const EMAIL_API_TOKEN = process.env.EMAIL_API_TOKEN;

                await fetch(EMAIL_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${EMAIL_API_TOKEN}`,
                    },
                    body: JSON.stringify({
                        to: normalizedIdentifier,
                        subject: "Jilani Home Password Reset",
                        body: `Your Jilani Home password reset code is ${otpCode}. It expires in 5 minutes.`,
                    }),
                });
            } else {
                const SMSNOC_API_URL = "https://api.smsnoc.com/v3/sms/send";
                const SMSNOC_API_TOKEN = process.env.SMSNOC_API_TOKEN;

                await fetch(SMSNOC_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${SMSNOC_API_TOKEN}`,
                    },
                    body: JSON.stringify({
                        recipient: normalizedIdentifier,
                        message: `Your Jilani Home password reset code is ${otpCode}. It expires in 5 minutes.`,
                    }),
                });
            }
        }

        return { success: true, message: "Reset code sent successfully." };
    } catch (error) {
        console.error("Error sending forgot password OTP:", error);
        return { success: false, message: "Failed to send reset code. Please try again." };
    }
}

export async function resetPasswordWithOTP(identifier: string, otp: string, newPassword: string) {
    try {
        if (!identifier || !otp || !newPassword) {
            return { success: false, message: "Please provide all required fields." };
        }

        if (newPassword.length < 6) {
            return { success: false, message: "Password must be at least 6 characters." };
        }

        let normalizedIdentifier = identifier.trim();
        const isEmail = identifier.includes("@");
        if (!isEmail) {
            normalizedIdentifier = identifier.replace(/[\s\-()+]/g, '');
        }

        // 1. Verify the OTP exists and is not expired
        const [tokenRecord] = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, normalizedIdentifier),
                    eq(verificationTokens.token, otp),
                    gte(verificationTokens.expires, new Date())
                )
            );

        if (!tokenRecord) {
            return { success: false, message: "Invalid or expired reset code." };
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update the user password
        if (isEmail) {
            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(eq(users.email, normalizedIdentifier));
        } else {
            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(eq(users.phoneNumber, normalizedIdentifier));
        }

        // 4. Delete the token to prevent reuse
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.identifier, normalizedIdentifier));

        return { success: true, message: "Password reset successfully!" };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
}