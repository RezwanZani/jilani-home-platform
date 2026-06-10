"use client";
 
import { useState } from "react";
import { uploadProfilePicture } from "@/lib/actions/user-actions";
import { Camera, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
 
export function ProfileHeader({ user }: { user: any }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState(user?.image || "/avatar-default.png");
 
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
 
        if (file.size > 4 * 1024 * 1024) {
            setError("File must be under 4MB.");
            return;
        }
 
        setError("");
        setIsUploading(true);
 
        // Instant local preview
        setPreview(URL.createObjectURL(file));
 
        const formData = new FormData();
        formData.append("profileImage", file);
 
        const result = await uploadProfilePicture(formData);
 
        if (!result.success) {
            setError(result.error || "Upload failed");
            setPreview(user?.image || "/avatar-default.png"); // Revert on fail
        }
 
        setIsUploading(false);
    };
 
    const getInitials = () => {
        if (!user?.name) return "U";
        const parts = user.name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };
 
    const isDefaultAvatar = preview === "/avatar-default.png" || preview.includes("default") || !preview;
 
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-3xl">
 
            {/* 1. Avatar Image Section */}
            <div className="relative group">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-md bg-white dark:bg-slate-900 relative">
                    {isDefaultAvatar ? (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center !text-white font-extrabold text-2xl tracking-wider select-none">
                            {getInitials()}
                        </div>
                    ) : (
                        <img
                            src={preview}
                            alt="Profile"
                            className={`object-cover bg-white w-full h-full transition-opacity duration-200 ${isUploading ? "opacity-50" : "opacity-100"}`}
                        />
                    )}
 
                    {/* Loading Spinner Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>
 
                {/* Floating Camera Badge (Matches design guidelines) */}
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95">
                    <Camera size={14} strokeWidth={2.5} className="!text-white" />
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>
 
            {/* 2. Text & Actions Section */}
            <div className="flex flex-col mt-1.5 text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                    {user?.name || "No Name Set"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 font-medium leading-relaxed">
                    Profile photo will be visible to hosts.
                </p>
 
                <div className="flex items-center justify-center md:justify-start gap-4">
 
                    {/* Styled Upload Button */}
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={14} />
                        UPLOAD NEW
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>
 
                    {/* Styled Remove Button */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-[#F03A47] hover:bg-red-100 dark:hover:bg-red-950/40 transition-all font-bold text-xs uppercase tracking-wider active:scale-95"
                        disabled={isUploading}
                        onClick={() => {
                            // Clear upload state / revert to default
                            setPreview("/avatar-default.png");
                            setError("");
                            toast.success("Profile photo removed!");
                        }}
                    >
                        <Trash2 size={14} />
                        REMOVE
                    </button>
 
                </div>
 
                {/* Error Display */}
                {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}
            </div>
 
        </div>
    );
}
