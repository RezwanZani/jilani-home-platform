import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe Auth.js configuration.
 * 
 * This file contains ONLY config that can run in the Edge Runtime (middleware).
 * It must NOT import any Node.js-only modules like:
 *   - bcryptjs (hashing)
 *   - postgres / pg (database drivers)
 *   - drizzle-orm with postgres adapter
 *
 * The actual provider `authorize()` logic lives in auth.ts which extends this
 * config and runs only in the Node.js runtime (API routes, server components).
 *
 * The middleware only needs to decode the JWT — it never calls authorize(),
 * signIn(), or makes DB queries. So this edge-safe config is sufficient.
 */
export const authConfig: NextAuthConfig = {
    trustHost: true,
    session: { strategy: "jwt" },

    // Providers are declared here so NextAuth can register them,
    // but authorize() is a no-op stub. The real authorize() functions
    // are defined in auth.ts which overrides these providers.
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            id: "password-login",
            name: "Password",
            credentials: {
                identifier: { label: "Email or Phone Number", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: () => null, // Stub — real logic in auth.ts
        }),
        Credentials({
            id: "phone-otp",
            name: "PhoneOTP",
            credentials: {
                phoneNumber: { label: "Phone Number", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            authorize: () => null,
        }),
        Credentials({
            id: "email-otp",
            name: "EmailOTP",
            credentials: {
                email: { label: "Email", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            authorize: () => null,
        }),
    ],

    callbacks: {
        // 1. SIGN IN INTERCEPTOR
        // In the edge-safe config, we allow all sign-ins through.
        // The full signIn callback with DB checks is in auth.ts.
        // This callback is NOT called by the middleware — only by API routes.

        // 2. JWT SESSION BUILDER
        async jwt({ token, user, trigger, session, account }) {
            // 'account' and 'user' are ONLY present on the very first login request
            if (account && user) {
                // For Credentials providers, the user object comes from authorize()
                // which already queried the DB in auth.ts
                token.id = user.id;
                token.phoneNumber = user.phoneNumber;
                token.role = user.role;
            }

            // Handle the manual session update from the Onboarding page
            if (trigger === "update" && session?.phoneNumber) {
                token.phoneNumber = session.phoneNumber;
            }

            return token;
        },

        // 3. PASS TO BROWSER
        async session({ session, token }) {
            // If the token has no id (e.g., ghost session, corrupted token),
            // nullify the user so the middleware treats them as unauthenticated.
            if (!token?.id) {
                session.user = undefined as any;
                return session;
            }

            if (token && session.user) {
                session.user.id = token.id;
                session.user.phoneNumber = token.phoneNumber;
                session.user.role = token.role;
            }
            return session;
        },
    },
};
