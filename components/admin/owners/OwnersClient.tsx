"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  MoreVertical,
  Filter,
  Upload,
  Loader2,
  ArrowDownUp,
  ArrowDownAZ,
  ArrowUpAZ,
  Edit3, Trash2, Plus,
  PhoneCall,
  MessageCircle,
  ArrowDown01,
  ArrowUp01
} from "lucide-react";
import OwnerFormModal from "./OwnerFormModal";
import BulkOwnerUploadModal from "./BulkOwnerUploadModal"; // Updated import name
import AdvancedFilter from "./AdvancedFilter";
import { fetchOwners, deleteOwner, deleteMultipleOwners } from "@/lib/actions/owner-actions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientDataListProps {
  initialData: any[];
  limit: number;
  hasMore: boolean;
}

export default function OwnersClient({ initialData = [], limit = 10, hasMore = false }: ClientDataListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("updatedAt"); // Default to updatedAt based on schema

  const [owners, setOwners] = useState(initialData || []);
  const [hasMoreData, setHasMoreData] = useState(hasMore);
  const [isLoading, setIsLoading] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // UUIDs are strings
  const [ownerToEdit, setOwnerToEdit] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter State adapted for Owners
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    name: "",
    phone: "",
  });

  // Close dropdown if user clicks outside
  useEffect(() => {
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  // function to refresh the current data
  const refreshData = async () => {
    setIsLoading(true);
    const result = await fetchOwners(currentPage, limit, search, sortKey, sortOrder, activeFilters);
    setOwners(result.data || []);
    setHasMoreData(result.hasMore || false);
    setIsLoading(false);
  };

  // ==========================================
  // SERVER-SIDE SEARCH (Debounced)
  // ==========================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Prevent double fetching on mount if nothing changed
      if (search === "" && currentPage === 1 && owners === initialData && !activeFilters.name && !activeFilters.phone) return;

      setIsLoading(true);
      // Fetch Page 1 whenever search OR filters change
      const result = await fetchOwners(1, limit, search, sortKey, sortOrder, activeFilters);

      setOwners(result.data || []);
      setHasMoreData(result.hasMore || false);
      setCurrentPage(1);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, limit, activeFilters]);

  // ==========================================
  // PAGINATION HANDLERS
  // ==========================================
  const handleNext = async () => {
    if (!hasMoreData || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;

    const result = await fetchOwners(nextPage, limit, search, sortKey, sortOrder, activeFilters);

    setOwners(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || isLoading) return;
    setIsLoading(true);
    const prevPage = currentPage - 1;

    const result = await fetchOwners(prevPage, limit, search, sortKey, sortOrder, activeFilters);

    setOwners(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(prevPage);
    setIsLoading(false);
  };

  //============================================
  //  HANDLE SORTING
  //============================================
  const handleSort = async (newSortKey: string) => {
    if (isLoading) return;

    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    setSortKey(newSortKey);

    setIsLoading(true);
    const result = await fetchOwners(currentPage, limit, search, newSortKey, newSortOrder, activeFilters);
    setOwners(result.data || []);
    setHasMoreData(result.hasMore || false);
    setIsLoading(false);
  };

  //============================================
  // DELETE, UPDATE
  //============================================
  const handleDelete = async (id: string) => { // ID is string (UUID)
    if (confirm("Are you sure you want to delete this Owner? This action cannot be undone.")) {
      const result = await deleteOwner(id);
      if (result.success) {
        setOwners(prev => prev.filter(o => o.id !== id));
      } else {
        alert(result.error);
      }
    }
  };

  const handleEdit = (Owner: any) => {
    setOwnerToEdit(Owner);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setOwnerToEdit(null);
    setIsFormOpen(true);
  };

  // BULK SELECTION STATE
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // UUIDs are strings
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === owners.length && owners.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(owners.map((o) => o.id));
    }
  };

  const toggleSelect = (id: string) => { // ID is string
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} Owners?`)) return;

    setIsBulkDeleting(true);
    const result = await deleteMultipleOwners(selectedIds);

    if (result.success) {
      setOwners((prev) => prev.filter((o) => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    } else {
      alert(result.error);
    }
    setIsBulkDeleting(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Contact Management</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Property Owners</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Manage property owners, phone numbers, and WhatsApp contacts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4.5 h-4.5" />
            Bulk Upload
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Owner
          </button>
          <OwnerFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            initialData={ownerToEdit}
            onSuccess={refreshData}
          />
        </div>
      </motion.div>

      <BulkOwnerUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onComplete={() => { setIsBulkUploadOpen(false); refreshData(); }}
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Owner name, phone, or WhatsApp..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
          <Filter className="w-5 h-5" />
          Advanced Filter
        </button>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={activeFilters}
        onApply={(newFilters) => {
          setActiveFilters(newFilters);
        }}
      />

      {/* BULK ACTION TOOLBAR */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 mb-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
              {selectedIds.length}
            </span>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Owners Selected
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-5 text-left w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.length === owners.length && owners.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>

                <th onClick={() => handleSort("name")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Owner Name {sortKey !== "name" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th onClick={() => handleSort("propertyCount")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Properties {sortKey !== "propertyCount" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDown01 className="w-3.5 h-3.5" /> : <ArrowUp01 className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th onClick={() => handleSort("phone")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Phone {sortKey !== "phone" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th onClick={() => handleSort("whatsapp")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    WhatsApp {sortKey !== "whatsapp" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex justify-end items-center gap-2">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {owners.map((owner, i) => (
                <motion.tr
                  key={owner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0.5 : 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-5 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-gray-100 dark:bg-gray-800"
                      checked={selectedIds.includes(owner.id)}
                      onChange={() => toggleSelect(owner.id)}
                    />
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm flex-shrink-0">
                        <span className="font-bold text-sm">{owner.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{owner.name}</p>
                        {owner.name_bn && <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">{owner.name_bn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center min-w-[32px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm border border-slate-200 dark:border-slate-600">
                        {owner.propertyCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">{owner.phone}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {owner.whatsapp ? (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{owner.whatsapp}</p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Not provided</span>
                    )}
                  </td>

                  <td className="px-8 py-5 text-right relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer outline-none">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1">
                        <DropdownMenuItem
                          onClick={() => handleEdit(owner)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 focus:text-gray-900 dark:focus:text-white"
                        >
                          <Edit3 className="w-4 h-4 mr-2 text-blue-500" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(owner.id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              {owners.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500">
                    No Owners found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Page {currentPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={!hasMoreData || isLoading}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
