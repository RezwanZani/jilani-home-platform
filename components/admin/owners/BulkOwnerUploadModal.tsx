"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, X, CheckCircle, FileSpreadsheet, Loader2, FileText, Users } from "lucide-react";
import { bulkInsertOwners } from "@/lib/actions/owner-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEMPLATE_DATA = [
    {
        name: "John Doe",
        name_bn: "জন ডন",
        phone: "01711000000",
        whatsapp: "01711000000"
    }
];

interface BulkOwnerUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export default function BulkOwnerUploadModal({ isOpen, onClose, onComplete }: BulkOwnerUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fullData, setFullData] = useState<any[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const downloadTemplate = (format: 'csv' | 'xlsx') => {
        const worksheet = XLSX.utils.json_to_sheet(TEMPLATE_DATA);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Owners_Template");
        XLSX.writeFile(workbook, `Jilani_Owners_Template.${format}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const workbook = XLSX.read(bstr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError("The uploaded file is empty.");
                    return;
                }

                setFullData(jsonData);
                setPreviewData(jsonData.slice(0, 5));

            } catch (err) {
                setError("Failed to parse file. Please ensure it's a valid CSV or XLSX.");
            }
        };

        reader.readAsBinaryString(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const confirmUpload = async () => {
        setIsUploading(true);
        setError("");

        const result = await bulkInsertOwners(fullData);

        if (result.success) {
            alert(`Successfully added ${result.count} owners!`);
            resetState();
            if (onComplete) onComplete();
            onClose();
        } else {
            setError(result.error || "Upload failed.");
        }
        setIsUploading(false);
    };

    const resetState = () => {
        setFullData([]);
        setPreviewData([]);
        setError("");
    };

    const handleClose = () => {
        if (isUploading) return;
        resetState();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 md:p-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Owners</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isUploading}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold border border-red-500/20">
                                {error}
                            </div>
                        )}

                        {/* State 1: Awaiting File Upload */}
                        {fullData.length === 0 && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Need a template?</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Download a pre-formatted file to get started.</p>
                                    </div>
                                    <div className="flex gap-2 mt-3 sm:mt-0">
                                        <button
                                            onClick={() => downloadTemplate('csv')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> CSV
                                        </button>
                                        <button
                                            onClick={() => downloadTemplate('xlsx')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors shadow-sm"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                                        </button>
                                    </div>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                                >
                                    <Upload className="w-8 h-8 text-blue-500 mb-3" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Click to upload CSV or XLSX</p>
                                    <p className="text-xs text-gray-500 mt-1">Headers must match the template exactly.</p>
                                    <input
                                        type="file"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {/* State 2: Preview Mode */}
                        {fullData.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-blue-500">
                                        Found {fullData.length} total rows. Showing preview (Top 5).
                                    </p>
                                    <button onClick={resetState} className="text-gray-400 hover:text-red-500 transition-colors text-xs font-bold flex items-center gap-1">
                                        <X className="w-3 h-3" /> Clear File
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Name (EN) *</th>
                                                <th className="px-4 py-3 font-semibold">Name (BN)</th>
                                                <th className="px-4 py-3 font-semibold">Phone *</th>
                                                <th className="px-4 py-3 font-semibold">WhatsApp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {previewData.map((row, idx) => (
                                                <tr key={idx} className="text-gray-800 dark:text-gray-200">
                                                    <td className="px-4 py-3">{row.name || row.Name || <span className="text-red-500 font-bold">Missing</span>}</td>
                                                    <td className="px-4 py-3">{row.name_bn || row['Name (BN)'] || row.name_bn || '-'}</td>
                                                    <td className="px-4 py-3">{row.phone || row.Phone || <span className="text-red-500 font-bold">Missing</span>}</td>
                                                    <td className="px-4 py-3">{row.whatsapp || row.Whatsapp || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={confirmUpload} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        {isUploading ? "Saving to Database..." : `Confirm & Save ${fullData.length} Owners`}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}