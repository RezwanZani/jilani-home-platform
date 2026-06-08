"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { motion } from "motion/react";

export default function LogoutPage() {
    useEffect(() => {
        // The moment this page loads in the browser, it securely deletes the cookie 
        // and sends the user back to the login screen.
        signOut({ callbackUrl: "/login" });
    }, []);

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                {/* A subtle loading spinner so the user isn't staring at a blank screen for a split second */}
                <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#9CA3AF] font-sans text-sm tracking-wide animate-pulse">
                    Clearing ghost session...
                </p>
            </motion.div>
        </div>
    );
}
