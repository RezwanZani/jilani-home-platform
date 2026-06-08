"use client"
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { KeyRound, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/components/providers/UserProvider";
import { updatePassword } from "@/lib/actions/user-actions";
import { cn } from "@/lib/utils";


export default function PasswordUpdateForm() {
    const user = useUser();
    const hasPassword = !!user?.password;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setStatus({ type: "", message: "" });

            if (!newPassword || !confirmPassword) {
                setStatus({ type: "error", message: "All fields are required" });
                return;
            }

            const formData = new FormData();

            formData.append("currentPassword", currentPassword);
            formData.append("newPassword", newPassword);
            formData.append("confirmPassword", confirmPassword);


            const result = await updatePassword(formData);

            if (result.success) {
                setStatus({ type: "success", message: "Password updated successfully!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setStatus({ type: "error", message: result.error || "Failed to update password" });
            }

            setIsSaving(false);
        } catch (error) {
            console.log(error);
            setStatus({ type: "error", message: "Something went wrong" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            {/* Password Change Section */}
            <GlassCard className="min-w-0 p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <KeyRound className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">Change Password</h3>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key="password-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                        <form onSubmit={handleUpdatePassword}>
                            {status.message && (
                                <div
                                    className={cn(
                                        "p-3 rounded-lg text-sm mb-4",
                                        status.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                                    )}
                                >
                                    {status.message}
                                </div>
                            )}

                            {!hasPassword && (
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm mb-4">
                                    You don't have a password. Please create one to secure your account.
                                </div>
                            )}

                            {hasPassword && (
                                <div className="space-y-2.5 mb-4">
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2.5 mb-4">
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {newPassword.length < 6 && !isSaving && newPassword && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Must be at least 6 characters long.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2.5 mb-4">
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {newPassword !== confirmPassword && !isSaving && confirmPassword && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Password Doesn't Match!
                                    </p>
                                )}
                                {newPassword === confirmPassword && !isSaving && confirmPassword && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Password Matches!
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving || newPassword !== confirmPassword || !newPassword || !confirmPassword}
                                className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
                            >
                                {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <> Update Password</>}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </GlassCard>
        </>
    );
}
