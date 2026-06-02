"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, X, CheckCircle, FileSpreadsheet, Loader2, FileText, Download } from "lucide-react";
import { bulkProcessProperties } from "@/lib/actions/property-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TEMPLATE_DATA = [{
    "Title (EN)": "Luxury 3BHK",
    "Title (BN)": "বিলাসবহুল ফ্ল্যাট",
    "Description (EN)": "Beautiful house",
    "Type": "House",
    "Price": 25000,
    "Price Type": "Month",
    "Size (Sqft)": 1500,
    "Rooms": 3,
    "Zone ID": "",
    "Zone Name (EN)": "Mirpur 10",
    "Zone Name (BN)": "মিরপুর ১০",
    "City": "Dhaka",
    "Thana": "Mirpur",
    "Area": "Block C",
    "Owner ID": "",
    "Owner Name (EN)": "John Doe",
    "Owner Phone": "01700000000",
    "Owner WhatsApp": "01700000000",
    "House/Flat (EN)": "House 12",
    "House/Flat (BN)": "বাড়ি ১২",
    "Road (EN)": "Road 5",
    "Road (BN)": "রোড ৫",
    "Block (EN)": "Block C",
    "Block (BN)": "ব্লক সি",
    "Landmark (EN)": "Beside Mosque",
    "Landmark (BN)": "মসজিদের পাশে",
    "Additional Line (EN)": "",
    "Additional Line (BN)": ""
}];

export default function BulkPropertyUploadModal({ isOpen, onClose, onComplete }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fullData, setFullData] = useState<any[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [resultData, setResultData] = useState<any[] | null>(null);
    const [error, setError] = useState("");

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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, `Properties_Template.${format}`);
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
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                
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

        // Ensure plain object serialization for Server Action
        const plainData = JSON.parse(JSON.stringify(fullData));
        const result = await bulkProcessProperties(plainData);

        if (result.success) {
            setResultData(result.processedRows || []);
            // Auto-download the file with status columns
            if (result.processedRows && result.processedRows.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(result.processedRows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Upload Results");
                XLSX.writeFile(workbook, `Property_Upload_Report_${new Date().getTime()}.xlsx`);
            }
            if (onComplete) onComplete();
        } else {
            setError(result.error || "Failed to process bulk upload.");
        }
        setIsUploading(false);
    };

    const downloadReport = () => {
        if (!resultData) return;
        const worksheet = XLSX.utils.json_to_sheet(resultData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Upload Results");
        XLSX.writeFile(workbook, `Property_Upload_Report_${new Date().getTime()}.xlsx`);
        resetState();
        onClose();
    };

    const resetState = () => {
        setFullData([]);
        setPreviewData([]);
        setResultData(null);
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 md:p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Properties</h2>
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

                        {resultData ? (
                            <div className="text-center space-y-4 py-8">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Processing Complete</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Some rows may have failed due to missing data. Your status report should have downloaded automatically.</p>
                                <Button onClick={downloadReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Download className="w-4 h-4 mr-2" /> Download Report Again</Button>
                            </div>
                        ) : fullData.length === 0 ? (
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
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-blue-500">
                                        Found {fullData.length} total rows. Showing preview (Top 5).
                                    </p>
                                    <button onClick={resetState} className="text-gray-400 hover:text-red-500 transition-colors text-xs font-bold flex items-center gap-1">
                                        <X className="w-3 h-3" /> Clear File
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 custom-scrollbar">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                            <tr>
                                                {Object.keys(TEMPLATE_DATA[0]).map((header) => (
                                                    <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {previewData.map((row, idx) => (
                                                <tr key={idx} className="text-gray-800 dark:text-gray-200">
                                                    {Object.keys(TEMPLATE_DATA[0]).map((header) => (
                                                        <td key={header} className="px-4 py-3">
                                                            {row[header] ? row[header] : <span className="text-gray-400">-</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={confirmUpload} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        {isUploading ? "Saving to Database..." : `Confirm & Save ${fullData.length} Properties`}
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