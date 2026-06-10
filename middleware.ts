import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user;

    const hasPhoneNumber = !!user?.phoneNumber;
    const role = user?.role; // Should now correctly be "admin" or "user"

    const path = req.nextUrl.pathname;
    const isOnboardingPage = path === "/onboarding";
    const isAuthPage = path === "/login" || path === "/signup" || path.startsWith("/forgot-password");

    // Define the routes you want to lock behind authentication
    const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/admin");

    // 1. Not Logged In -> Keep away from protected areas
    if (!isLoggedIn) {
        if (isProtectedRoute || isOnboardingPage) {
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }
        return NextResponse.next();
    }

    // --- FROM HERE DOWN, THE USER IS LOGGED IN ---

    // Define where they should land after logging in
    const defaultLandingPage = role === "admin" ? "/admin" : "/dashboard";

    // 2. Keep away from Auth pages
    if (isAuthPage) {
        return NextResponse.redirect(new URL(defaultLandingPage, req.nextUrl));
    }

    // 3. Onboarding Shield: If the JWT already has a phone number
    //    and they visit /onboarding, redirect them to their dashboard.
    //    NOTE: We intentionally do NOT redirect to /onboarding when the JWT
    //    lacks a phone number. The dashboard/admin layouts check the DB
    //    (the authoritative source) and redirect to /onboarding if needed.
    //    Doing it here from the JWT would cause an infinite redirect loop
    //    when the JWT is stale (e.g., right after onboarding completion).
    if (hasPhoneNumber && isOnboardingPage) {
        return NextResponse.redirect(new URL(defaultLandingPage, req.nextUrl));
    }

    // 4. RBAC Shields — strict role isolation
    if (path.startsWith("/admin") && role !== "admin") {
        // Kick normal users out of the admin panel
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    if (path.startsWith("/dashboard") && role === "admin") {
        // Kick admins out of the user dashboard
        return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};