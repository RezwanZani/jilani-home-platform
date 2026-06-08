"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    maxFiles?: number;
    value: File[];
    onChange: (files: File[]) => void;
    label?: string;
    existingUrls?: string[];
    onRemoveExisting?: (url: string) => void;
}

export function ImageUploader({ maxFiles = 1, value, onChange, label, existingUrls = [], onRemoveExisting }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => file.type.startsWith("image/"));

        if (maxFiles === 1) {
            onChange([validFiles[0]]); // Replace if single file
        } else {
            const combined = [...value, ...validFiles].slice(0, maxFiles);
            onChange(combined);
        }
    };

    const removeFile = (index: number) => {
        const newValues = [...value];
        newValues.splice(index, 1);
        onChange(newValues);
    };

    return (
        <div className="space-y-3">
            {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{label}</label>}

            {/* Upload Zone */}
            {(value.length + existingUrls.length < maxFiles || maxFiles === 1 && (value.length === 0 && existingUrls.length === 0)) && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                        isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple={maxFiles > 1}
                        className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {maxFiles === 1 ? "PNG, JPG up to 5MB" : `Up to ${maxFiles} images`}
                    </p>
                </div>
            )}

            {/* Previews */}
            {(value.length > 0 || existingUrls.length > 0) && (
                <div className={cn("grid gap-4 mt-4", maxFiles === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3")}>
                    <AnimatePresence>
                        {existingUrls.map((url, idx) => (
                            <motion.div
                                key={"existing-" + idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group"
                            >
                                <img src={url} alt="preview" className="w-full h-full object-cover" />
                                {onRemoveExisting && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRemoveExisting(url); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                        {value.map((file, idx) => (
                            <motion.div
                                key={file.name + idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group"
                            >
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
