import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, Shield, CheckCircle2, KeyRound, Phone, Loader2 } from "lucide-react";
import { sendPhoneOTP, verifyAndUpdatePhone } from "@/lib/actions/auth-action";
import { useUser } from "@/components/providers/UserProvider";
import { useSession } from "next-auth/react";

export default function PhoneUpdateForm() {
    const user = useUser();
    const { update } = useSession();

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [phoneStep, setPhoneStep] = useState<"form" | "otp" | "success">("form");

    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            setMessage(null);

            if (!phone || phone.length !== 11) {
                setMessage({ type: "error", text: "Please enter a valid 11-digit phone number" });
                return;
            }

            const result = await sendPhoneOTP(phone);
            if (result.success) {
                setPhoneStep("otp");
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

            const result = await verifyAndUpdatePhone(phone, otp);
            if (result.success) {
                setPhoneStep("success");
                if (phone !== user?.phoneNumber) {
                    await update({ phoneNumber: phone });
                }

                setIsUpdating(false);
                setOtp("");
                setPhone("");

                setTimeout(() => {
                    setPhoneStep("form");
                }, 5000);
            } else {
                setMessage({ type: "error", text: result.message });
                setIsUpdating(false);
            }
        } catch (err) {
            console.log(err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <>
            < GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm" >
                <div className="flex items-center gap-3 mb-4">
                    <Phone className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Phone Number</h3>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={phoneStep === "otp" ? (e) => { e.preventDefault(); handleUpdate(otp); } : handleSendOtp} className="max-w-md mt-6">

                    <AnimatePresence mode="wait">
                        {phoneStep === "form" && (
                            <motion.div key="phone-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                                <div className="space-y-2.5">
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">New Phone Number</label>
                                    <div className="flex">
                                        <input type="tel"
                                            name="phone"
                                            id="phone"
                                            placeholder="01XXXXXXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
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

                        {phoneStep === "otp" && (
                            <motion.div key="phone-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-medium">
                                    We've sent a 6-digit verification code via SMS to your new phone number.
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
                                        {isUpdating ? "Verifying..." : "Verify & Update Number"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setPhoneStep("form"); setOtp(""); setMessage(null); }}
                                        className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {phoneStep === "success" && (
                            <motion.div key="phone-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl max-w-xl">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Phone Number Successfully Updated</h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">Your account phone number has been verified and updated.</p>
                                <button
                                    onClick={() => setPhoneStep("form")}
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
