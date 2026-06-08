"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowDownUp,
  ArrowDownAZ,
  ArrowUpAZ,
  Edit3, Plus, Tag, Filter
} from "lucide-react";
import PromoFormModal from "./PromoFormModal";
import AdvancedPromoFilter from "./AdvancedPromoFilter";
import { fetchPromoCodes, bulkUpdatePromoStatus } from "@/lib/actions/promo-actions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ClientDataListProps {
  initialData: any[];
  limit: number;
  hasMore: boolean;
}

export default function PromosClient({ initialData, limit, hasMore }: ClientDataListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("code");

  const [promos, setPromos] = useState(initialData);
  const [hasMoreData, setHasMoreData] = useState(hasMore);
  const [isLoading, setIsLoading] = useState(false);

  const [promoToEdit, setPromoToEdit] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    isActive: undefined,
    discountType: "all",
    minAmount: "",
    maxAmount: "",
    validUntil: "",
  });

  // SERVER-SIDE SEARCH (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Avoid initial double fetch if nothing changed
      if (search === "" && currentPage === 1 && promos === initialData && Object.values(activeFilters).every(v => v === "" || v === undefined || v === "all")) return;

      setIsLoading(true);
      const result = await fetchPromoCodes(1, limit, search, sortKey, sortOrder, activeFilters);

      setPromos(result.data || []);
      setHasMoreData(result.hasMore || false);
      setCurrentPage(1);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, limit]);

  // PAGINATION HANDLERS
  const handleNext = async () => {
    if (!hasMoreData || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;

    const result = await fetchPromoCodes(nextPage, limit, search, sortKey, sortOrder, activeFilters);

    setPromos(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || isLoading) return;
    setIsLoading(true);
    const prevPage = currentPage - 1;

    const result = await fetchPromoCodes(prevPage, limit, search, sortKey, sortOrder, activeFilters);

    setPromos(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(prevPage);
    setIsLoading(false);
  };

  // HANDLE SORTING
  const handleSort = async (sortKey: string) => {
    if (isLoading) return;

    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    setSortKey(sortKey);

    setIsLoading(true);
    const result = await fetchPromoCodes(currentPage, limit, search, sortKey, newSortOrder, activeFilters);
    setPromos(result.data || []);
    setHasMoreData(result.hasMore || false);
    setIsLoading(false);
  };

  const handleEdit = (promo: any) => {
    setPromoToEdit(promo);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setPromoToEdit(null);
    setIsFormOpen(true);
  };

  const handleApplyFilter = async (filters: any) => {
    setActiveFilters(filters);
    setIsLoading(true);
    const result = await fetchPromoCodes(1, limit, search, sortKey, sortOrder, filters);
    setPromos(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(1);
    setIsLoading(false);
  };

  // BULK SELECTION
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === promos.length && promos.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(promos.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (status: boolean) => {
    setIsBulkProcessing(true);
    const result = await bulkUpdatePromoStatus(selectedIds, status);

    if (result.success) {
      setPromos((prev) => prev.map((p) => selectedIds.includes(p.id) ? { ...p, isActive: status } : p));
      setSelectedIds([]);
      toast.success(`Marked as ${status ? 'Active' : 'Inactive'}.`);
    } else {
      toast.error(result.error);
    }
    setIsBulkProcessing(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Promotions</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Promo Codes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Manage discounts and promotional campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Promo Code
          </button>
          <PromoFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            initialData={promoToEdit}
          />
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promo codes..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold transition-all"
        >
          <Filter className="w-5 h-5" />
          Advanced Filter
          {Object.values(activeFilters).some(v => v !== "" && v !== undefined && v !== "all") && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] ml-1">
              {Object.values(activeFilters).filter(v => v !== "" && v !== undefined && v !== "all").length}
            </span>
          )}
        </button>

        <AdvancedPromoFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilter}
          currentFilters={activeFilters}
        />
      </div>

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
              Promos Selected
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
              onClick={() => handleBulkStatusUpdate(true)}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(false)}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Mark Inactive
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
                    checked={selectedIds.length === promos.length && promos.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>

                <th onClick={() => handleSort("code")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Code {sortKey !== "code" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th onClick={() => handleSort("discountType")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Discount {sortKey !== "discountType" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Uses
                </th>
                <th onClick={() => handleSort("isActive")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Status {sortKey !== "isActive" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {promos.map((promo, i) => (
                <motion.tr
                  key={promo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0.5 : 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-5 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-gray-100 dark:bg-gray-800"
                      checked={selectedIds.includes(promo.id)}
                      onChange={() => toggleSelect(promo.id)}
                    />
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm flex-shrink-0">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{promo.code}</p>
                        {promo.validUntil && (
                          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                            Valid till: {new Date(promo.validUntil).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {promo.discountType === 'percentage' 
                        ? `${Number(promo.discountValue)}% OFF` 
                        : `৳ ${Number(promo.discountValue).toFixed(2)} OFF`}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                      {promo.discountType.replace('_', ' ')}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {promo.timesUsed} <span className="text-[11px] text-gray-400">used</span>
                    </p>
                    {promo.maxUses && (
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">out of {promo.maxUses}</p>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                      promo.isActive
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20"
                        : "text-gray-500 bg-gray-50 dark:bg-white/5 border-gray-500/20"
                    )}>
                      {promo.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
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
                          onClick={() => handleEdit(promo)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 focus:text-gray-900 dark:focus:text-white"
                        >
                          <Edit3 className="w-4 h-4 mr-2 text-blue-500" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              {promos.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                    No promo codes found matching your search.
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
