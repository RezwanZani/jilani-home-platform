import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    // Read the phone number directly from the JWT we built earlier
    const hasPhoneNumber = !!req.auth?.user?.phoneNumber;

    const isOnboardingPage = req.nextUrl.pathname === "/onboarding";
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";

    // 1. Not logged in -> Send to Login
    if (!isLoggedIn && !isAuthPage && !isOnboardingPage) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 2. Logged in -> Keep away from Auth Pages
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // 3. 🚨 THE NEW SHIELD: Logged in + Verified -> Keep away from Onboarding
    if (isLoggedIn && hasPhoneNumber && isOnboardingPage) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};