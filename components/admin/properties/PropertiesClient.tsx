"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
    Search, MoreVertical, Filter, Loader2,
    ArrowDownUp, ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01,
    Edit3, Trash2, Home, Upload, MapPin, User, Plus, Eye,
    ChevronDown, CheckCircle, XCircle, Clock, AlertTriangle,
    Star
} from "lucide-react";
import BulkPropertyUploadModal from "./BulkPropertyUploadModal";
import AdvancedFilter from "./AdvancedFilter";
import PropertyForm from "./PropertyFormModal"; // 🚨 Imported the form
import { fetchProperties, deleteProperty, deleteMultipleProperties, bulkUpdatePropertyStatus, fetchPropertyById } from "@/lib/actions/property-actions";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
    initialData: any[];
    limit: number;
    hasMore: boolean;
}

export default function PropertiesClient({ initialData = [], limit = 10, hasMore = false }: Props) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortKey, setSortKey] = useState("createdAt");

    const [PropertiesList, setPropertiesList] = useState(initialData);
    const [hasMoreData, setHasMoreData] = useState(hasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Modals State
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [PropertyToEdit, setPropertyToEdit] = useState<any | null>(null);
    const [activeFilters, setActiveFilters] = useState({ type: "all", status: "all" });

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Search Debounce
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (search === "" && currentPage === 1 && PropertiesList === initialData && activeFilters.type === "all" && activeFilters.status === "all") return;
            setIsLoading(true);
            const result = await fetchProperties(1, limit, search, sortKey, sortOrder, activeFilters);
            setPropertiesList(result.data || []);
            setHasMoreData(result.hasMore || false);
            setCurrentPage(1);
            setIsLoading(false);
        }, 400);
        return () => clearTimeout(delay);
    }, [search, limit, activeFilters]);

    // Refresh data function
    const refreshData = async () => {
        setIsLoading(true);
        const result = await fetchProperties(currentPage, limit, search, sortKey, sortOrder, activeFilters);
        setPropertiesList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setIsLoading(false);
    };

    // Pagination & Sorting Handlers
    const handleNext = async () => {
        if (!hasMoreData || isLoading) return;
        setIsLoading(true);
        const result = await fetchProperties(currentPage + 1, limit, search, sortKey, sortOrder, activeFilters);
        setPropertiesList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
    };

    const handlePrev = async () => {
        if (currentPage <= 1 || isLoading) return;
        setIsLoading(true);
        const result = await fetchProperties(currentPage - 1, limit, search, sortKey, sortOrder, activeFilters);
        setPropertiesList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setCurrentPage(prev => prev - 1);
        setIsLoading(false);
    };

    const handleSort = async (newSortKey: string) => {
        if (isLoading) return;
        const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
        setSortOrder(newSortOrder);
        setSortKey(newSortKey);
        setIsLoading(true);
        const result = await fetchProperties(currentPage, limit, search, newSortKey, newSortOrder, activeFilters);
        setPropertiesList(result.data || []);
        setIsLoading(false);
    };

    // Actions
    const handleDelete = async (id: string) => {
        if (confirm("Move property to trash?")) {
            const res = await deleteProperty(id);
            if (res.success) setPropertiesList(prev => prev.filter(p => p.id !== id));
            else toast.error(res.error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Trash ${selectedIds.length} properties?`)) return;
        setIsBulkProcessing(true);
        const res = await deleteMultipleProperties(selectedIds);
        if (res.success) {
            setPropertiesList(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
            toast.success("Properties deleted.");
        } else toast.error(res.error);
        setIsBulkProcessing(false);
    };

    const handleBulkStatusUpdate = async (status: 'pending' | 'active' | 'inactive' | 'expired') => {
        setIsBulkProcessing(true);
        const res = await bulkUpdatePropertyStatus(selectedIds, status);
        if (res.success) {
            // Optimistically update UI
            setPropertiesList(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
            setSelectedIds([]);
            toast.success(`Marked as ${status}`);
        } else toast.error(res.error);
        setIsBulkProcessing(false);
    };

    const openAddModal = () => {
        setPropertyToEdit(null);
        setIsFormOpen(true);
    };

    const openEditModal = async (property: any) => {
        setIsFetchingDetails(true);
        const res = await fetchPropertyById(property.id);
        setIsFetchingDetails(false);
        if (res.success) {
            setPropertyToEdit(res.data);
            setIsFormOpen(true);
        } else {
            toast.error("Failed to load property details.");
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {isFetchingDetails && (
                <div className="fixed top-0 left-0 w-full h-1 z-[10000] overflow-hidden bg-blue-500/20">
                    <motion.div
                        className="h-full bg-blue-600 w-1/2"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    />
                </div>
            )}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Real Estate Core</p>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Properties Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base">Manage houses, offices, and halls.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsBulkUploadOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                        <Upload className="w-4 h-4" /> Bulk Upload
                    </button>
                    {/* 🚨 Fixed Add Property Button */}
                    <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Add Property
                    </button>
                </div>
            </motion.div>

            <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title..." className="flex-1 bg-transparent border-none outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400" />
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </div>
                <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm transition-all">
                    <Filter className="w-5 h-5" /> Filters
                </button>
            </div>

            {/* Render Modals */}
            <BulkPropertyUploadModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} onComplete={refreshData} />
            <AdvancedFilter isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentFilters={activeFilters} onApply={setActiveFilters} />
            <PropertyForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={PropertyToEdit} onSuccess={refreshData} />

            {/* 🚨 Enhanced Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">{selectedIds.length}</span>
                        <div className="font-bold text-sm text-blue-800 dark:text-blue-300">Properties Selected</div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => setSelectedIds([])} className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline hidden sm:block">Cancel</button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button disabled={isBulkProcessing} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold flex gap-2 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                    Change Status <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1">
                                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')} className="text-emerald-600 cursor-pointer font-medium text-xs"><CheckCircle className="w-3.5 h-3.5 mr-2" /> Mark Active (Approved)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')} className="text-yellow-600 cursor-pointer font-medium text-xs"><Clock className="w-3.5 h-3.5 mr-2" /> Mark Pending</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')} className="text-orange-600 cursor-pointer font-medium text-xs"><AlertTriangle className="w-3.5 h-3.5 mr-2" /> Mark Inactive</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('expired')} className="text-gray-500 cursor-pointer font-medium text-xs"><XCircle className="w-3.5 h-3.5 mr-2" /> Mark Expired</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button onClick={handleBulkDelete} disabled={isBulkProcessing} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex gap-2 items-center transition-colors">
                            {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Trash
                        </button>
                    </div>
                </motion.div>
            )}

            <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-5 w-12">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" onChange={() => setSelectedIds(selectedIds.length === PropertiesList.length ? [] : PropertiesList.map(p => p.id))} checked={selectedIds.length === PropertiesList.length && PropertiesList.length > 0} />
                                </th>
                                <th onClick={() => handleSort("title")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase cursor-pointer">
                                    Property Details {sortKey !== "title" ? <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" /> : sortOrder === "asc" ? <ArrowDownAZ className="w-3 h-3 inline ml-1 opacity-50" /> : <ArrowUpAZ className="w-3 h-3 inline ml-1 opacity-50" />}
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Location & Owner</th>
                                <th onClick={() => handleSort("price")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase cursor-pointer">
                                    Pricing & Specs {sortKey !== "price" ? <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" /> : sortOrder === "asc" ? <ArrowDownAZ className="w-3 h-3 inline ml-1 opacity-50" /> : <ArrowUpAZ className="w-3 h-3 inline ml-1 opacity-50" />}
                                </th>
                                <th onClick={() => handleSort("rating")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase cursor-pointer">
                                    Rating {sortKey !== "rating" ? <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" /> : sortOrder === "asc" ? <ArrowDown01 className="w-3 h-3 inline ml-1 opacity-50" /> : <ArrowUp01 className="w-3 h-3 inline ml-1 opacity-50" />}
                                </th>
                                <th onClick={() => handleSort("viewsCount")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase cursor-pointer">
                                    Views {sortKey !== "viewsCount" ? <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" /> : sortOrder === "asc" ? <ArrowDown01 className="w-3 h-3 inline ml-1 opacity-50" /> : <ArrowUp01 className="w-3 h-3 inline ml-1 opacity-50" />}
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Status</th>
                                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {PropertiesList.map((prop, i) => (
                                <motion.tr key={prop.id} initial={{ opacity: 0 }} animate={{ opacity: isLoading ? 0.5 : 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-gray-800" checked={selectedIds.includes(prop.id)} onChange={() => setSelectedIds(prev => prev.includes(prop.id) ? prev.filter(id => id !== prop.id) : [...prev, prop.id])} />
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-white/10">
                                                {prop.coverImage ? <img src={prop.coverImage} className="w-full h-full object-cover" /> : <Home className="w-5 h-5 text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{prop.title}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                    {prop.type}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {prop.zoneName}, {prop.zoneCity}</div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300"><User className="w-3.5 h-3.5 text-indigo-400" /> {prop.ownerName || "Unknown"}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-gray-900 dark:text-white">৳{prop.price} <span className="text-xs text-gray-500 font-medium mt-0.5">{prop.priceType === "one-time" ? "(One Time)" : `/ ${prop.priceType}`}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{prop.roomCount} Rooms • {prop.sizeSqft || 0} Sqft</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-md rounded-lg px-2 py-1">
                                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                                            <span className="text-white text-xs font-semibold">{prop.averageRating || 0}</span>
                                            <span className="text-gray-400 text-xs">({prop.totalReviews || 0})</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{prop.viewsCount || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            prop.status === 'active' ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" :
                                                prop.status === 'pending' ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400" :
                                                    prop.status === 'inactive' ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400" :
                                                        "bg-gray-50 border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400"
                                        )}>
                                            {prop.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all outline-none">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1">
                                                {/* 🚨 Edit Button Fixed */}
                                                <DropdownMenuItem onClick={() => openEditModal(prop)} disabled={isFetchingDetails} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">
                                                    {isFetchingDetails && PropertyToEdit?.id === prop.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" /> : <Edit3 className="w-4 h-4 mr-2 text-blue-500" />} Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="px-3 py-2 text-sm font-medium text-red-600 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => handleDelete(prop.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Trash
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}
                            {PropertiesList.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-gray-500 dark:text-gray-400 font-medium">No properties found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page {currentPage}</p>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} disabled={currentPage === 1 || isLoading} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase disabled:opacity-50 transition-all hover:bg-gray-50 dark:hover:bg-white/10">Prev</button>
                        <button onClick={handleNext} disabled={!hasMoreData || isLoading} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase disabled:opacity-50 transition-all hover:bg-gray-50 dark:hover:bg-white/10">Next</button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}