'use client';

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Building2, MapPin, Plus, Minus, Search, Sparkles, User, Check, ChevronDown, List, ListOrdered, FileImage, Loader2, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadPropertyImagesToR2 } from "@/lib/actions/uploads";
import { createProperty, updateProperty } from "@/lib/actions/property-actions";
import { toast } from "sonner";
import { fetchZones } from "@/lib/actions/zone-actions";
import { fetchOwners } from "@/lib/actions/owner-actions";

// ==========================================
// 1. SUB-COMPONENTS (Fixed Colors)
// ==========================================

function RichTextEditor({ value, onChange, placeholder, label }: any) {
    const editorRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || ""; }, [value]);

    const handleCommand = (command: string, arg: string = "") => {
        document.execCommand(command, false, arg);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    return (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">{label}</Label>
            <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 bg-white dark:bg-slate-950 transition-all shadow-sm">
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-white/10">
                    <button type="button" onClick={() => handleCommand('bold')} className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">B</button>
                    <button type="button" onClick={() => handleCommand('italic')} className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs italic text-gray-700 dark:text-gray-300">I</button>
                    <button type="button" onClick={() => handleCommand('underline')} className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs underline text-gray-700 dark:text-gray-300">U</button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button type="button" onClick={() => handleCommand('insertUnorderedList')} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"><List className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleCommand('insertOrderedList')} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"><ListOrdered className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button type="button" onClick={() => handleCommand('removeFormat')} className="px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-[10px] uppercase font-bold text-red-500">Reset</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    className="p-4 min-h-[140px] max-h-[220px] overflow-y-auto outline-none text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-gray-500"
                    onInput={(e) => onChange(e.currentTarget.innerHTML)}
                    data-placeholder={placeholder}
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                />
            </div>
        </div>
    );
}

function TagInput({ tags, onChange, placeholder, label }: any) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) onChange([...tags, newTag]);
            setInputValue("");
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    return (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">{label}</Label>
            <div className="flex flex-wrap gap-2 p-2.5 border border-gray-200 dark:border-white/10 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 bg-white dark:bg-slate-950 transition-all min-h-[50px] items-center shadow-sm">
                {tags.map((tag: string, i: number) => (
                    <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-100 dark:border-blue-500/25">
                        {tag} <button type="button" onClick={() => onChange(tags.filter((_: any, idx: number) => idx !== i))} className="hover:bg-blue-100 dark:hover:bg-blue-500/20 p-0.5 rounded-full text-blue-500"><X className="w-3 h-3" /></button>
                    </motion.span>
                ))}
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={tags.length === 0 ? placeholder : "Add tag..."} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 py-1 min-w-[120px] focus:ring-0" />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Type tag name and press <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300">Enter</kbd> to add.</p>
        </div>
    );
}

// ==========================================
// 2. MAIN FORM COMPONENT
// ==========================================
interface PropertyFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
    onSuccess?: () => void;
}

export default function PropertyForm({ isOpen, onClose, initialData, onSuccess }: PropertyFormProps) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        type: "house", zoneId: "", price: "", priceType: "month", slug: "", status: "pending", title: "", title_bn: "", description: "", description_bn: "", amenities: [] as string[], amenities_bn: [] as string[], sizeSqft: "", roomCount: 2, ownerId: "", coverImage: "", videoUrl: "",
    });

    const [privateAddress, setPrivateAddress] = useState({
        house: "", house_bn: "", road: "", road_bn: "", block: "", block_bn: "", landmark: "", landmark_bn: "", additionalLine: "", additionalLine_bn: ""
    });

    const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing");
    const [newOwner, setNewOwner] = useState({ name: "", name_bn: "", phone: "", whatsapp: "" });

    const [loadingZones, setLoadingZones] = useState(false);
    const [zones, setZones] = useState<any[]>([]);
    const [zoneSearch, setZoneSearch] = useState("");
    const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
    const zoneDropdownRef = useRef<HTMLDivElement>(null);

    const [ownerSearch, setOwnerSearch] = useState("");
    const [ownerResults, setOwnerResults] = useState<any[]>([]);
    const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
    const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
    const ownerDropdownRef = useRef<HTMLDivElement>(null);

    const [coverImageFile, setCoverImageFile] = useState<File[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");
    const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
    const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            let parsedAmenities = [];
            if (Array.isArray(initialData.amenities)) {
                parsedAmenities = initialData.amenities;
            } else if (typeof initialData.amenities === 'string') {
                try { parsedAmenities = JSON.parse(initialData.amenities); } catch (e) {}
            }
            
            let parsedAmenitiesBn = [];
            if (Array.isArray(initialData.amenities_bn)) {
                parsedAmenitiesBn = initialData.amenities_bn;
            } else if (typeof initialData.amenities_bn === 'string') {
                try { parsedAmenitiesBn = JSON.parse(initialData.amenities_bn); } catch (e) {}
            }

            setFormData({
                type: initialData.type || "house",
                zoneId: initialData.zoneId ? String(initialData.zoneId) : "",
                price: initialData.price ? Number(initialData.price).toLocaleString('en-IN') : "",
                priceType: initialData.priceType || "month",
                slug: initialData.slug || "",
                status: initialData.status || "pending",
                title: initialData.title || "",
                title_bn: initialData.title_bn || "",
                description: initialData.description || "",
                description_bn: initialData.description_bn || "",
                amenities: parsedAmenities,
                amenities_bn: parsedAmenitiesBn,
                sizeSqft: initialData.sizeSqft ? String(initialData.sizeSqft) : "",
                roomCount: initialData.roomCount || 2,
                ownerId: initialData.ownerId || "",
                coverImage: initialData.coverImage || "",
                videoUrl: initialData.videoUrl || "",
            });
            if (initialData.location) setPrivateAddress({ house: "", house_bn: "", road: "", road_bn: "", block: "", block_bn: "", landmark: "", landmark_bn: "", additionalLine: "", additionalLine_bn: "", ...initialData.location });
            if (initialData.ownerName) {
                setSelectedOwner({ id: initialData.ownerId, name: initialData.ownerName, phone: initialData.ownerPhone });
            }
            setExistingCoverUrl(initialData.coverImage || "");
            setExistingGalleryUrls(initialData.galleryUrls || []);
            setDeletedImageUrls([]);
            setCoverImageFile([]);
            setGalleryFiles([]);
            setIsSlugManuallyEdited(true); // Don't auto-update slug on edit
        } else if (isOpen && !initialData) {
            // Reset form on new open
            setFormData({ type: "house", zoneId: "", price: "", priceType: "month", slug: "", status: "pending", title: "", title_bn: "", description: "", description_bn: "", amenities: [], amenities_bn: [], sizeSqft: "", roomCount: 2, ownerId: "", coverImage: "", videoUrl: "" });
            setPrivateAddress({ house: "", house_bn: "", road: "", road_bn: "", block: "", block_bn: "", landmark: "", landmark_bn: "", additionalLine: "", additionalLine_bn: "" });
            setSelectedOwner(null);
            setOwnerMode("existing");
            setCoverImageFile([]);
            setGalleryFiles([]);
            setExistingCoverUrl("");
            setExistingGalleryUrls([]);
            setDeletedImageUrls([]);
            setIsSlugManuallyEdited(false);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (isOpen && isZoneDropdownOpen && zones.length === 0) {
            setLoadingZones(true);
            fetchZones(1, 100).then(res => { setZones(res.data || []); setLoadingZones(false); });
        }
    }, [isOpen, isZoneDropdownOpen]);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (ownerSearch.trim() && isOwnerDropdownOpen) {
                const res = await fetchOwners(1, 10, ownerSearch);
                setOwnerResults(res.data || []);
            } else {
                setOwnerResults([]);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [ownerSearch, isOwnerDropdownOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) setIsZoneDropdownOpen(false);
            if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) setIsOwnerDropdownOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.replace(/\D/g, "");
        if (!rawVal) return setFormData(prev => ({ ...prev, price: "" }));
        let lastThree = rawVal.substring(rawVal.length - 3);
        let otherParts = rawVal.substring(0, rawVal.length - 3);
        if (otherParts !== "") lastThree = "," + lastThree;
        setFormData(prev => ({ ...prev, price: otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.zoneId || !formData.slug) {
            toast.error("Title, Slug, and Zone are required fields.");
            return;
        }

        if (ownerMode === "existing" && !formData.ownerId) {
            toast.error("Please select an existing owner.");
            return;
        }

        if (ownerMode === "new" && (!newOwner.name || !newOwner.phone)) {
            toast.error("Please provide the new owner's name and phone.");
            return;
        }

        setIsSubmitting(true);

        try {
            let finalCoverUrl = existingCoverUrl;
            let finalGalleryUrls: string[] = [];

            if (coverImageFile.length > 0 || galleryFiles.length > 0) {
                const uploadData = new FormData();
                if (coverImageFile.length > 0) uploadData.append("cover", coverImageFile[0]);
                galleryFiles.forEach(f => uploadData.append("gallery", f));
                
                const uploadResult = await uploadPropertyImagesToR2(uploadData);
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || "Failed to upload images");
                }
                if (coverImageFile.length > 0) finalCoverUrl = uploadResult.coverUrl || "";
                if (galleryFiles.length > 0) finalGalleryUrls = uploadResult.galleryUrls || [];
            }

            const finalPropertyData = {
                ...formData,
                price: formData.price.replace(/,/g, ''),
                coverImage: finalCoverUrl,
                galleryUrls: finalGalleryUrls,
                deletedImageUrls,
                ownerMode,
                newOwner,
                privateAddress,
            };

            let dbResult;
            if (initialData) dbResult = await updateProperty(initialData.id, finalPropertyData);
            else dbResult = await createProperty(finalPropertyData);

            if (!dbResult.success) throw new Error(dbResult.error);

            toast.success(initialData ? "Property updated successfully!" : "Property published!");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            toast.error(error.message || "Failed to save property.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredZones = zones.filter(z => z.name.toLowerCase().includes(zoneSearch.toLowerCase()) || z.name_bn?.includes(zoneSearch));
    const selectedZone = zones.find(z => z.id === Number(formData.zoneId));

    const getZoneDisplay = (z: any) => {
        if (!z) return <span className="text-gray-400 dark:text-gray-500">Select Zone</span>;
        const details = [z.city, z.thana, z.area].filter(Boolean).join(", ");
        return details ? `${z.name} (${details})` : z.name;
    };

    const handleRemoveExistingCover = (url: string) => {
        setExistingCoverUrl("");
        setDeletedImageUrls(prev => [...prev, url]);
    };

    const handleRemoveExistingGallery = (url: string) => {
        setExistingGalleryUrls(prev => prev.filter(u => u !== url));
        setDeletedImageUrls(prev => [...prev, url]);
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full md:w-[680px] lg:w-[750px] xl:w-[850px] h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-white/10 flex flex-col z-10">

                        {/* Header */}
                        <div className="p-6 md:p-8 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {initialData ? "Edit Listing" : "Create Listing"} <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage premium real estate details.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin dark:scrollbar-thumb-white/10">

                            {/* SECTION 1: CORE DETAILS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                                    <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><Layers className="w-4 h-4" /></div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase">Section 1: Core Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Property Type *</Label>
                                        <div className="relative">
                                            <select value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))} className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-semibold text-gray-900 dark:text-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500/20">
                                                <option value="house">🏡 House (Residential)</option>
                                                <option value="office">🏢 Office Space</option>
                                                <option value="hall">🎭 Community Hall</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Slug *</Label>
                                        <Input 
                                            value={formData.slug} 
                                            onChange={(e) => {
                                                setIsSlugManuallyEdited(true);
                                                setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') }));
                                            }} 
                                            placeholder="luxury-penthouse" 
                                            className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm" 
                                        />
                                    </div>

                                    {/* Searchable Zone Dropdown */}
                                    <div className="space-y-2" ref={zoneDropdownRef}>
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Zone *</Label>
                                        <div className="relative">
                                            <button type="button" onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)} className="w-full h-12 px-4 rounded-2xl border border-gray-200 dark:border-white/10 text-left text-sm font-semibold flex items-center justify-between bg-white dark:bg-slate-950 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20">
                                                <span className="truncate flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                                    <span className="truncate">
                                                        {loadingZones ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : getZoneDisplay(selectedZone)}
                                                    </span>
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </button>

                                            <AnimatePresence>
                                                {isZoneDropdownOpen && (
                                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
                                                        <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-2">
                                                            <Search className="w-4 h-4 text-gray-400" />
                                                            <input type="text" placeholder="Search Mirpur..." value={zoneSearch} onChange={(e) => setZoneSearch(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full text-gray-900 dark:text-white placeholder:text-gray-400" />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto p-1 divide-y divide-gray-50 dark:divide-white/5">
                                                            {filteredZones.map((z) => (
                                                                <button type="button" key={z.id} onClick={() => { setFormData(prev => ({ ...prev, zoneId: String(z.id) })); setIsZoneDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 rounded-xl flex flex-col justify-start transition-colors">
                                                                    <div className="flex justify-between w-full">
                                                                        <span>{z.name}</span>
                                                                        <span className="text-gray-400 dark:text-gray-500">{z.name_bn}</span>
                                                                    </div>
                                                                    {[z.city, z.thana, z.area].filter(Boolean).length > 0 && (
                                                                        <span className="text-[10px] text-gray-500 mt-0.5">
                                                                            {[z.city, z.thana, z.area].filter(Boolean).join(", ")}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Price (BDT) *</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute left-4 top-3.5 text-blue-500 font-bold text-sm">৳</div>
                                                <Input type="text" value={formData.price} onChange={handlePriceChange} placeholder="1,50,000" className="h-12 pl-8 pr-4 rounded-2xl font-bold bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm" />
                                            </div>
                                            <div className="relative w-1/3">
                                                <select value={formData.priceType} onChange={(e) => setFormData(prev => ({ ...prev, priceType: e.target.value }))} className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-semibold text-gray-900 dark:text-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500/20">
                                                    <option value="hour">/ Hour</option>
                                                    <option value="day">/ Day</option>
                                                    <option value="month">/ Month</option>
                                                    <option value="year">/ Year</option>
                                                    <option value="event">/ Event</option>
                                                    <option value="one-time">One-time</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Status *</Label>
                                        <div className="relative">
                                            <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-semibold text-gray-900 dark:text-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500/20">
                                                <option value="pending">🟡 Pending Verification</option>
                                                <option value="active">🟢 Active Listing</option>
                                                <option value="inactive">🔴 Inactive</option>
                                                <option value="expired">⌛ Expired</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: BILINGUAL CONTENT */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                                    <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"><Sparkles className="w-4 h-4" /></div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase">Section 2: Bilingual Content</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* English */}
                                    <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 space-y-6">
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">EN</span><h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">English Details</h4></div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Title *</Label>
                                            <Input 
                                                value={formData.title} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => {
                                                        if (!isSlugManuallyEdited) {
                                                            const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                                            return { ...prev, title: val, slug: generatedSlug };
                                                        }
                                                        return { ...prev, title: val };
                                                    });
                                                }} 
                                                placeholder="Luxury Penthouse" 
                                                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Description</Label>
                                            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Write property description..." className="w-full min-h-[140px] p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-y" />
                                        </div>
                                        <TagInput label="Amenities Tags" tags={formData.amenities} onChange={(tags: any) => setFormData(prev => ({ ...prev, amenities: tags }))} />
                                    </div>

                                    {/* Bengali */}
                                    <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 space-y-6">
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">BN</span><h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Bengali Details</h4></div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Title (Bengali)</Label>
                                            <Input value={formData.title_bn} onChange={(e) => setFormData(prev => ({ ...prev, title_bn: e.target.value }))} placeholder="লাক্সারি পেন্টহাউস" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Description (BN)</Label>
                                            <textarea value={formData.description_bn} onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))} placeholder="সম্পত্তির বিবরণ লিখুন..." className="w-full min-h-[140px] p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-y" />
                                        </div>
                                        <TagInput label="Amenities (BN)" tags={formData.amenities_bn} onChange={(tags: any) => setFormData(prev => ({ ...prev, amenities_bn: tags }))} />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: PAYWALL & OWNERSHIP */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                                    <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><User className="w-4 h-4" /></div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase">Section 3: Specs & Paywall Info</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Size (Sq. Ft.)</Label>
                                        <Input type="number" value={formData.sizeSqft} onChange={(e) => setFormData(prev => ({ ...prev, sizeSqft: e.target.value }))} className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Room Count</Label>
                                        <div className="flex items-center justify-between h-12 px-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-sm">
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, roomCount: Math.max(0, prev.roomCount - 1) }))} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"><Minus className="w-4 h-4" /></button>
                                            <span className="font-extrabold text-gray-900 dark:text-white">{formData.roomCount}</span>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, roomCount: prev.roomCount + 1 }))} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Private Address */}
                                <div className="space-y-4 md:col-span-3 p-5 rounded-3xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded bg-red-500 text-white"><MapPin className="w-3 h-3" /></div><h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400">Exact Address (Hidden behind Paywall)</h4></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">House/Flat (EN)</Label><Input value={privateAddress.house} onChange={(e) => setPrivateAddress(prev => ({ ...prev, house: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">House/Flat (BN)</Label><Input value={privateAddress.house_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, house_bn: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Road (EN)</Label><Input value={privateAddress.road} onChange={(e) => setPrivateAddress(prev => ({ ...prev, road: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Road (BN)</Label><Input value={privateAddress.road_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, road_bn: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Block (EN)</Label><Input value={privateAddress.block} onChange={(e) => setPrivateAddress(prev => ({ ...prev, block: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Block (BN)</Label><Input value={privateAddress.block_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, block_bn: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Landmark (EN)</Label><Input value={privateAddress.landmark} onChange={(e) => setPrivateAddress(prev => ({ ...prev, landmark: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Landmark (BN)</Label><Input value={privateAddress.landmark_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, landmark_bn: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Additional Line (EN)</Label><Input value={privateAddress.additionalLine} onChange={(e) => setPrivateAddress(prev => ({ ...prev, additionalLine: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Additional Line (BN)</Label><Input value={privateAddress.additionalLine_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, additionalLine_bn: e.target.value }))} className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                    </div>
                                </div>

                                {/* Owner Block */}
                                <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Owner Details *</Label>
                                        <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                                            <button type="button" onClick={() => setOwnerMode("existing")} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-colors", ownerMode === "existing" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400")}>Existing Owner</button>
                                            <button type="button" onClick={() => setOwnerMode("new")} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-colors", ownerMode === "new" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400")}>New Owner</button>
                                        </div>
                                    </div>

                                    {ownerMode === "existing" ? (
                                        <div className="relative" ref={ownerDropdownRef}>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                                <Input type="text" value={ownerSearch} onChange={(e) => { setOwnerSearch(e.target.value); setIsOwnerDropdownOpen(true); }} placeholder="Search existing owner by name or phone..." className="h-12 pl-11 rounded-2xl font-semibold bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm" />
                                            </div>
                                            <AnimatePresence>
                                                {isOwnerDropdownOpen && ownerResults.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute z-40 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                                                        {ownerResults.map((u) => (
                                                            <button type="button" key={u.id} onClick={() => { setSelectedOwner(u); setFormData(prev => ({ ...prev, ownerId: u.id })); setOwnerSearch(u.name); setIsOwnerDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between transition-colors">
                                                                <span className="font-bold text-gray-900 dark:text-white">{u.name}</span><span className="text-gray-500 dark:text-gray-400">{u.phone}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5">
                                            <div className="space-y-2"><Label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Name (EN) *</Label><Input value={newOwner.name} onChange={(e) => setNewOwner(prev => ({ ...prev, name: e.target.value }))} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                            <div className="space-y-2"><Label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Name (BN)</Label><Input value={newOwner.name_bn} onChange={(e) => setNewOwner(prev => ({ ...prev, name_bn: e.target.value }))} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Phone *</Label>
                                                <Input 
                                                    value={newOwner.phone} 
                                                    onChange={(e) => setNewOwner(prev => ({ ...prev, phone: e.target.value }))} 
                                                    onBlur={(e) => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.startsWith('880')) val = val.substring(2);
                                                        if (val.length > 0 && !val.startsWith('0')) val = '0' + val;
                                                        setNewOwner(prev => ({ ...prev, phone: val }));
                                                    }}
                                                    className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">WhatsApp</Label>
                                                <Input 
                                                    value={newOwner.whatsapp} 
                                                    onChange={(e) => setNewOwner(prev => ({ ...prev, whatsapp: e.target.value }))} 
                                                    onBlur={(e) => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.startsWith('880')) val = val.substring(2);
                                                        if (val.length > 0 && !val.startsWith('0')) val = '0' + val;
                                                        setNewOwner(prev => ({ ...prev, whatsapp: val }));
                                                    }}
                                                    className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 4: MEDIA UPLOAD */}
                            <div className="space-y-6 pb-4">
                                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                                    <div className="p-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400"><FileImage className="w-4 h-4" /></div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase">Section 4: Media Upload</h3>
                                </div>
                                <ImageUploader 
                                    label="Cover Image (Single) *" 
                                    maxFiles={1} 
                                    value={coverImageFile} 
                                    onChange={setCoverImageFile} 
                                    existingUrls={existingCoverUrl ? [existingCoverUrl] : []}
                                    onRemoveExisting={handleRemoveExistingCover}
                                />
                                <ImageUploader 
                                    label="Property Gallery (Up to 10 photos)" 
                                    maxFiles={10} 
                                    value={galleryFiles} 
                                    onChange={setGalleryFiles} 
                                    existingUrls={existingGalleryUrls}
                                    onRemoveExisting={handleRemoveExistingGallery}
                                />
                                <div className="space-y-2 mt-4">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Video URL (YouTube)</Label>
                                    <Input 
                                        value={formData.videoUrl} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))} 
                                        placeholder="https://www.youtube.com/watch?v=..." 
                                        className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" 
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Sticky Footer */}
                        <div className="p-6 md:p-8 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-white/5 flex gap-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</Button>
                            <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Property"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (!isMounted) return null;
    return createPortal(modalContent, document.body);
}
