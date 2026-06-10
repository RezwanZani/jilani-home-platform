// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPhoneOTP, verifyAndSavePhoneOTP } from "@/lib/actions/auth-action";
import { signOut, useSession, getSession } from "next-auth/react";

export default function OnboardingPage() {
    const router = useRouter();

    const { update } = useSession();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handler 1: Send the OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber) {
            setError("Please enter your phone number.");
            return;
        }

        setLoading(true);
        setError("");

        // Calls the action to generate and SMS the code
        const result = await sendPhoneOTP(phoneNumber);

        if (result.success) {
            setIsOtpMode(true);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    // Handler 2: Verify the OTP and Save
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return setError("Please enter the 6-digit code.");

        setLoading(true);
        setError("");

        // The Server Action will now automatically redirect the user to /dashboard 
        // upon success. If it returns, it means there was an error.
        const result = await verifyAndSavePhoneOTP(phoneNumber, otp);

        if (result?.success) {
            // 2. SUCCESS! Update the JWT session with the new phone number
            // so the middleware sees it immediately and doesn't redirect back here
            await update({ phoneNumber });
            // 3. Force a hard browser redirect to break out of the loading state
            // Fetch the fresh session to determine the user's role
            const freshSession = await getSession();
            const landingPage = freshSession?.user?.role === "admin" ? "/admin" : "/dashboard";
            window.location.href = landingPage;
        } else {
            // If there's an error (like a wrong OTP), show it and turn off loading
            setError(result?.message || "Failed to verify. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl text-blue-700 dark:text-blue-500 font-bold text-center mb-2">Welcome to Jilani Home!</h2>
                <p className="text-gray-600 text-center mb-6">
                    Please verify your phone number to complete your account setup.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {!isOtpMode ? (
                    // STEP 1: Enter Phone Number
                    <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-800 dark:text-gray-800 text-sm font-medium mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="017..."
                                className="w-full text-gray-800 dark:text-gray-700 border rounded p-2 focus:outline-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Sending Code..." : "Send Verification Code"}
                        </button>

                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="mt-4 text-sm text-red-500 hover:underline w-full text-center"
                        >
                            Cancel and Sign Out
                        </button>
                    </form>
                ) : (
                    // STEP 2: Enter OTP Code
                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-800 dark:text-gray-800 text-sm font-medium mb-1">Enter OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="w-full border text-gray-800 dark:text-gray-800 rounded p-2 focus:outline-blue-500 text-center tracking-widest text-lg"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-medium py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOtpMode(false)}
                            className="text-sm text-gray-500 mt-2 hover:underline"
                        >
                            Change Phone Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
