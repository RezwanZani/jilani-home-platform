import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, or, and, gte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

/**
 * Full Auth.js configuration — Node.js runtime ONLY.
 *
 * This file extends the edge-safe authConfig with the real provider
 * authorize() functions that need bcryptjs and database access.
 *
 * Import `auth`, `signIn`, `signOut`, `handlers` from THIS file in:
 *   - Server Components (layouts, pages)
 *   - Server Actions
 *   - API Routes
 *
 * Do NOT import from this file in middleware.ts — use auth.config.ts instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,

    // Override the providers with full authorize() implementations
    providers: [
        // --- 1. GOOGLE OAUTH ---
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),

        // --- 2 & 3. PASSWORD LOGIN (EMAIL OR PHONE) ---
        Credentials({
            id: "password-login",
            name: "Password",
            credentials: {
                identifier: { label: "Email or Phone Number", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) return null;

                const identifierStr = credentials.identifier as string;

                // Search database for the user by matching EITHER email or phone number
                const [user] = await db
                    .select()
                    .from(users)
                    .where(
                        or(
                            eq(users.email, identifierStr),
                            eq(users.phoneNumber, identifierStr)
                        )
                    );

                if (!user || !user.password) return null;

                // 🚨 BLOCK DELETED USERS
                if (user.deletedAt !== null) {
                    throw new Error("This account has been deactivated or deleted.");
                }

                // Verify the hashed password
                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (isPasswordValid) return user;
                return null;
            },
        }),

        // --- 4. PHONE OTP LOGIN ---
        Credentials({
            id: "phone-otp",
            name: "PhoneOTP",
            credentials: {
                phoneNumber: { label: "Phone Number", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phoneNumber || !credentials?.otp) return null;

                // Verify token exists, matches phone, and is not expired
                const [tokenRecord] = await db
                    .select()
                    .from(verificationTokens)
                    .where(
                        and(
                            eq(verificationTokens.identifier, credentials.phoneNumber as string),
                            eq(verificationTokens.token, credentials.otp as string),
                            gte(verificationTokens.expires, new Date())
                        )
                    );

                if (!tokenRecord) return null;

                // Delete token to prevent replay attacks
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, credentials.phoneNumber as string));

                // Find or create user
                let [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.phoneNumber, credentials.phoneNumber as string));

                if (!user) {
                    [user] = await db
                        .insert(users)
                        .values({ phoneNumber: credentials.phoneNumber as string })
                        .returning();
                }

                // 🚨 BLOCK DELETED USERS
                if (user.deletedAt !== null) {
                    throw new Error("This account has been deactivated or deleted.");
                }

                return user;
            },
        }),

        // --- 5. EMAIL OTP LOGIN ---
        Credentials({
            id: "email-otp",
            name: "EmailOTP",
            credentials: {
                email: { label: "Email", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) return null;

                // Verify token exists, matches email, and is not expired
                const [tokenRecord] = await db
                    .select()
                    .from(verificationTokens)
                    .where(
                        and(
                            eq(verificationTokens.identifier, credentials.email as string),
                            eq(verificationTokens.token, credentials.otp as string),
                            gte(verificationTokens.expires, new Date())
                        )
                    );

                if (!tokenRecord) return null;

                // Delete token to prevent replay attacks
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, credentials.email as string));

                // Find or create user based on email
                let [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email as string));

                if (!user) {
                    [user] = await db
                        .insert(users)
                        .values({ email: credentials.email as string })
                        .returning();
                }

                // 🚨 BLOCK DELETED USERS
                if (user.deletedAt !== null) {
                    throw new Error("This account has been deactivated or deleted.");
                }

                return user;
            },
        }),
    ],

    callbacks: {
        ...authConfig.callbacks,

        // Override signIn to add the Google user DB sync
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                const [existingUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email));

                if (existingUser) {
                    // 🚨 If the user exists AND has a deletedAt timestamp, block the login
                    if (existingUser.deletedAt !== null) {
                        return false;
                    }
                } else {
                    await db.insert(users).values({
                        id: crypto.randomUUID(),
                        name: user.name || "Google User",
                        email: user.email,
                        role: 'user',
                    });
                }
            }

            return true;
        },

        // Override JWT to handle Google-specific DB lookups on first login
        async jwt({ token, user, trigger, session, account }) {
            if (account && user) {
                if (account.provider === "google") {
                    // For Google, we need to fetch the DB user to get the role & phone
                    const [dbUser] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, user.email as string));

                    // 🚨 BLOCK INITIAL LOGIN FOR DELETED GOOGLE USERS
                    if (dbUser && dbUser.deletedAt !== null) {
                        throw new Error("This account has been deactivated.");
                    }

                    if (dbUser) {
                        token.id = dbUser.id;
                        token.phoneNumber = dbUser.phoneNumber;
                        token.role = dbUser.role;
                    }
                } else {
                    // For Credentials provider (Email/Phone + Password)
                    token.id = user.id;
                    token.phoneNumber = user.phoneNumber;
                    token.role = user.role;
                }
            }

            // Handle the manual session update from the Onboarding page
            if (trigger === "update" && session?.phoneNumber) {
                token.phoneNumber = session.phoneNumber;
            }

            return token;
        },
    },
});