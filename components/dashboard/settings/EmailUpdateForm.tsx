import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, Shield, CheckCircle2, KeyRound, Phone, Loader2 } from "lucide-react";
import { sendEmailOTP, verifyAndUpdateEmail } from "@/lib/actions/auth-action";
import { useUser } from "@/components/providers/UserProvider";
import { useSession } from "next-auth/react";

export default function EmailUpdateForm() {
    const user = useUser();
    const { update } = useSession();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [emailStep, setEmailStep] = useState<"form" | "otp" | "success">("form");

    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            setMessage(null);

            if (!email || !email.includes("@")) {
                setMessage({ type: "error", text: "Please enter a valid email" });
                return;
            }

            const result = await sendEmailOTP(email);
            if (result.success) {
                setEmailStep("otp");
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (err) {
            console.log(err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setIsUpdating(false);
        }
    }

    const handleUpdate = async (otp: string) => {
        try {
            setIsUpdating(true);
            setMessage(null);

            if (!otp || otp.length !== 6) {
                setMessage({ type: "error", text: "Please enter a valid 6-digit OTP" });
                return;
            }

            const result = await verifyAndUpdateEmail(email, otp);
            if (result.success) {
                setEmailStep("success");
                if (email !== user?.email) {
                    await update({ email: email });
                }

                setIsUpdating(false);
                setOtp("");
                setEmail("");

                setTimeout(() => {
                    setEmailStep("form");
                }, 5000);
            } else {
                setMessage({ type: "error", text: result.message });
                setIsUpdating(false);
            }
        } catch (err) {
            console.log(err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {

        }
    }

    return (
        <>
            < GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm" >
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Email Address</h3>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={emailStep === "otp" ? (e) => { e.preventDefault(); handleUpdate(otp); } : handleSendOtp} className="max-w-md mt-6">

                    <AnimatePresence mode="wait">
                        {emailStep === "form" && (
                            <motion.div key="email-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                                <div className="space-y-2.5">
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">New Email Address</label>
                                    <div className="flex">
                                        <input type="email"
                                            name="email"
                                            id="email"
                                            placeholder="example@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    {isUpdating ? "Sending..." : "Send Verification Code"}
                                </button>
                            </motion.div>
                        )}

                        {emailStep === "otp" && (
                            <motion.div key="email-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-medium">
                                    We've sent a 6-digit verification code via Email to your new email address.
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Code</label>
                                    <div className="flex gap-3">
                                        <input type="text"
                                            maxLength={6}
                                            value={otp}
                                            placeholder="123456"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                                            className="w-full h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-blue-500/50 transition-all" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={isUpdating || otp.length !== 6}
                                        className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95"
                                    >
                                        {isUpdating ? "Verifying..." : "Verify & Update Email"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setEmailStep("form"); setOtp(""); setMessage(null); }}
                                        className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {emailStep === "success" && (
                            <motion.div key="email-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl max-w-xl">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Email Address Successfully Updated</h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">Your account email address has been verified and updated.</p>
                                <button
                                    onClick={() => setEmailStep("form")}
                                    className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all"
                                >
                                    Done
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </GlassCard >
        </>
    )
}   
