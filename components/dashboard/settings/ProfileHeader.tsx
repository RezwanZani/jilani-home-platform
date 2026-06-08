"use client";

import { useState } from "react";
import { uploadProfilePicture } from "@/lib/actions/user-actions";
import { Camera } from "lucide-react";

export function ProfileHeader({ user }: { user: any }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    // Default to the user's current image, or a placeholder
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

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">

            {/* 1. Avatar Image Section */}
            <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                    <img
                        src={preview}
                        alt="Profile"
                        className={`object-cover bg-white w-full h-full transition-opacity duration-200 ${isUploading ? "opacity-50" : "opacity-100"}`}
                    />
                    {/* Loading Spinner Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Blue Camera Badge (Matches your screenshot) */}
                <div className="absolute -bottom-2 -right-2 bg-[#1A56DB] text-white p-1.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <Camera size={16} strokeWidth={2.5} />
                </div>
            </div>

            {/* 2. Text & Actions Section */}
            <div className="flex flex-col mt-2">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    {user?.name || "No Name Set"}
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-4 font-medium">
                    Profile photo will be visible to hosts.
                </p>

                <div className="flex items-center gap-6 text-[13px] font-bold tracking-wider">

                    {/* THE MAGIC: File Input hidden inside the label */}
                    <label className={`text-[#1A56DB] cursor-pointer hover:text-blue-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        UPLOAD NEW
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>

                    <button
                        type="button"
                        className="text-[#F03A47] hover:text-red-700 transition-colors"
                        disabled={isUploading}
                        onClick={() => alert("We can wire up a deleteServerAction here later!")}
                    >
                        REMOVE
                    </button>

                </div>

                {/* Error Display */}
                {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}
            </div>

        </div>
    );
}
