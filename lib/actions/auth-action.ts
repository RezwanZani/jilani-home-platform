"use server";

import { db } from "@/lib/db/index";
import { auth } from "@/lib/auth";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendSMS } from "@/lib/sms";
import { eq, and, gte } from "drizzle-orm";
import { sendEmail } from "@/lib/emails/email";
import { getJilaniEmailTemplate } from "@/lib/emails/email-template";
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

        const message = `Your Jilani Home verification code is: ${otpCode}. It will expire in 5 minutes.`;

        const smsResult = await sendSMS(phoneNumber, message);

        if (!smsResult.success) {
            // If SMS failed, we should probably delete the token we just created
            // so the user doesn't try to log in with a non-existent code.
            await db
                .delete(verificationTokens)
                .where(eq(verificationTokens.identifier, phoneNumber));

            // Return a user-friendly error. 
            // In a real app, you might want to fallback to Email OTP here if available.
            return {
                success: false,
                message: smsResult.error || "Failed to send verification code. Please try again or contact support."
            };
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
    const fromEmail = `JILANI HOME <noreply@${process.env.RESEND_DOMAIN}>`;

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
        }

        // 1. Write the inner content focused purely on the OTP
        const innerHtml = `
            <h2 style="margin-top: 0; color: #0f172a; text-align: center; font-size: 22px;">Secure Verification</h2>
            <p style="color: #475569; text-align: center; font-size: 15px; margin-bottom: 30px;">
            Please use the verification code below to securely sign in to your Jilani Home account.
            </p>
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 300px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <tr>
                <td style="padding: 24px; text-align: center;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; display: block;">
                    ${otpCode}
                </span>
                </td>
            </tr>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
            <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                ⚠️ Never share this code with anyone.
            </p>
            <p style="color: #64748b; font-size: 13px; margin-top: 0;">
                This code is valid for <strong>5 minutes</strong>. If you did not request this verification, please safely ignore this email.
            </p>
            </div>
        `;

        // 2. Wrap it in your beautiful branded template
        const finalHtml = getJilaniEmailTemplate("Your Jilani Home Verification Code", innerHtml);

        // 3. Send via your Resend gateway
        const response = await sendEmail(fromEmail, email, `Verification Code to Confirm Your Email Address`, finalHtml);


        if (!response.success) {
            throw new Error("Failed to send email via gateway.");
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
        if (isEmail) {
            const fromEmail = `JILANI HOME <noreply@${process.env.RESEND_DOMAIN}>`;
            // 1. Write the inner content focused purely on the OTP
            const innerHtml = `
            <h2 style="margin-top: 0; color: #0f172a; text-align: center; font-size: 22px;">Secure Verification</h2>
            <p style="color: #475569; text-align: center; font-size: 15px; margin-bottom: 30px;">
            Please use the verification code below to securely sign in to your Jilani Home account.
            </p>
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 300px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <tr>
                <td style="padding: 24px; text-align: center;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; display: block;">
                    ${otpCode}
                </span>
                </td>
            </tr>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
            <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                ⚠️ Never share this code with anyone.
            </p>
            <p style="color: #64748b; font-size: 13px; margin-top: 0;">
                This code is valid for <strong>5 minutes</strong>. If you did not request this verification, please safely ignore this email.
            </p>
            </div>
        `;

            // 2. Wrap it in your beautiful branded template
            const finalHtml = getJilaniEmailTemplate("Your Jilani Home Verification Code", innerHtml);

            // 3. Send via your Resend gateway
            const response = await sendEmail(fromEmail, normalizedIdentifier, `Verification Code for Password Reset`, finalHtml);


            if (!response.success) {
                // If Email failed, we should probably delete the token we just created
                // so the user doesn't try to log in with a non-existent code.
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, normalizedIdentifier));

                // Return a user-friendly error. 
                return {
                    success: false,
                    message: response.error || "Failed to send verification code. Please try again or contact support."
                };
            }

        } else {
            const message = `Your Jilani Home verification code is: ${otpCode}. It will expire in 5 minutes.`;

            const smsResult = await sendSMS(normalizedIdentifier, message);

            if (!smsResult.success) {
                // If SMS failed, we should probably delete the token we just created
                // so the user doesn't try to log in with a non-existent code.
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, normalizedIdentifier));

                // Return a user-friendly error. 
                return {
                    success: false,
                    message: smsResult.error || "Failed to send verification code. Please try again or contact support."
                };
            }
        }

        return { success: true, message: `Reset code sent to ${normalizedIdentifier} successfully.` };
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