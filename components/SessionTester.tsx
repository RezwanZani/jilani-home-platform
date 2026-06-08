"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionTester() {
    const { data: session, status } = useSession();

    useEffect(() => {
        // We wait for the status to finish loading before logging
        if (status !== "loading") {
            console.log("=== 🌐 CLIENT-SIDE SESSION CHECK ===");
            console.log("Status:", status); // "authenticated" or "unauthenticated"
            console.log("User Data:", session?.user || "No user found");
            console.log("=====================================");
        }
    }, [session, status]);

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg border border-white/20 z-50 shadow-2xl">
            <p className="font-bold mb-1">Session Status: {status}</p>
            <p className="text-gray-400">Press F12 to see full data in console.</p>
        </div>
    );
}
