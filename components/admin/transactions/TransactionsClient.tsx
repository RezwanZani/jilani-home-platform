"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Loader2,
  ArrowDownUp,
  ArrowDownAZ,
  ArrowUpAZ,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import AdvancedTransactionFilter from "./AdvancedTransactionFilter";
import { TransactionInvoicePDF } from "./TransactionInvoicePDF";
import { updateTransactionStatus, fetchTransactions } from "@/lib/actions/transaction-actions";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Eye, Check, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ManualAddModal } from "./ManualAddModal";

interface ClientDataListProps {
  initialData: any[];
  limit: number;
  hasMore: boolean;
  packages?: any[];
  promos?: any[];
}

export default function TransactionsClient({ initialData, limit, hasMore, packages = [], promos = [] }: ClientDataListProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("createdAt");

  const [transactions, setTransactions] = useState(initialData);
  const [hasMoreData, setHasMoreData] = useState(hasMore);
  const [isLoading, setIsLoading] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    userName: "",
    gateway: "all",
    status: "all",
    packageName: "",
    promoCode: "",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateUntil: "",
  });

  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; trxId: string | null; remark: string; isRevoke: boolean }>({ isOpen: false, trxId: null, remark: "", isRevoke: false });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // SERVER-SIDE SEARCH (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Avoid initial double fetch if nothing changed
      if (search === "" && currentPage === 1 && transactions === initialData && Object.values(activeFilters).every(v => v === "" || v === undefined || v === "all")) return;

      setIsLoading(true);
      const result = await fetchTransactions(1, limit, search, sortKey, sortOrder, activeFilters);

      setTransactions(result.data || []);
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

    const result = await fetchTransactions(nextPage, limit, search, sortKey, sortOrder, activeFilters);

    setTransactions(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || isLoading) return;
    setIsLoading(true);
    const prevPage = currentPage - 1;

    const result = await fetchTransactions(prevPage, limit, search, sortKey, sortOrder, activeFilters);

    setTransactions(result.data || []);
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
    const result = await fetchTransactions(currentPage, limit, search, sortKey, newSortOrder, activeFilters);
    setTransactions(result.data || []);
    setHasMoreData(result.hasMore || false);
    setIsLoading(false);
  };

  const handleApplyFilter = async (filters: any) => {
    setActiveFilters(filters);
    setIsLoading(true);
    const result = await fetchTransactions(1, limit, search, sortKey, sortOrder, filters);
    setTransactions(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: "success" | "failed", overrideRemark?: string) => {
    if (status === "failed" && typeof overrideRemark === "undefined") {
      const trx = transactions.find((t: any) => t.id === id);
      setRejectModal({ isOpen: true, trxId: id, remark: "", isRevoke: trx?.status === "success" });
      return;
    }

    const res = await updateTransactionStatus(id, status, overrideRemark);
    if (res.success) {
      toast.success(`Transaction marked as ${status}`);
      setTransactions(transactions.map((trx: any) => trx.id === id ? { ...trx, status, remark: overrideRemark || trx.remark } : trx));
    } else {
      toast.error(res.error || "Failed to update transaction");
    }
  };

  const submitReject = () => {
    if (rejectModal.trxId) {
      handleUpdateStatus(rejectModal.trxId, "failed", rejectModal.remark);
      setRejectModal({ isOpen: false, trxId: null, remark: "", isRevoke: false });
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Financials</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">View and filter user point purchases.</p>
        </div>
        <button
          onClick={() => setIsManualAddOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Manual Add
        </button>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold transition-all cursor-pointer"
        >
          <Filter className="w-5 h-5" />
          Advanced Filter
          {Object.values(activeFilters).some(v => v !== "" && v !== undefined && v !== "all") && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] ml-1">
              {Object.values(activeFilters).filter(v => v !== "" && v !== undefined && v !== "all").length}
            </span>
          )}
        </button>

        <AdvancedTransactionFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilter}
          currentFilters={activeFilters}
        />
      </div>

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Transaction
                </th>
                <th className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Payment Details
                </th>
                <th className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  User
                </th>
                <th className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Package
                </th>
                <th onClick={() => handleSort("amountPaid")} className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Amount {sortKey !== "amountPaid" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th onClick={() => handleSort("status")} className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  <span className="flex items-center gap-2 cursor-pointer">
                    Status {sortKey !== "status" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                  </span>
                </th>
                <th className="hidden md:table-cell px-8 py-5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {transactions.map((trx, i) => (
                <React.Fragment key={trx.id}>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0.5 : 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer md:cursor-default"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleRow(trx.id);
                    }
                  }}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm flex-shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {trx.invoiceNumber ? `INV: ${trx.invoiceNumber}` : 'No Invoice'}
                          </p>
                          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                            TrxID: {trx.gatewayTrxId || 'N/A'}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(trx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="md:hidden text-gray-400 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                        {expandedRows[trx.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-8 py-5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{trx.gateway || 'N/A'}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.senderNumber || 'N/A'}</p>
                    {trx.paymentScreenshot && (
                      <button 
                        onClick={() => setScreenshotModalUrl(trx.paymentScreenshot)}
                        className="mt-1 text-[10px] flex items-center gap-1 font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View Proof
                      </button>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-8 py-5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.userName || 'N/A'}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.userEmail || 'N/A'}</p>
                    {trx.userPhone && <p className="text-[11px] font-medium text-gray-500 mt-0.5">{trx.userPhone}</p>}
                  </td>
                  <td className="hidden md:table-cell px-8 py-5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.packageName || 'Unknown'}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.pointsCredited} Pts</p>
                  </td>
                  <td className="hidden md:table-cell px-8 py-5">
                    <div className="flex flex-col gap-1">
                      {Number(trx.discountAmount) > 0 ? (
                        <>
                          <p className="text-[11px] font-bold text-gray-400 line-through">৳ {Number(trx.originalAmount).toFixed(2)}</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳ {Number(trx.amountPaid).toFixed(2)}</p>
                          {trx.promoCode && (
                            <span className="inline-flex self-start mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                              {trx.promoCode} (-৳{Number(trx.discountAmount).toFixed(2)})
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-bold text-gray-900 dark:text-white">৳ {Number(trx.amountPaid).toFixed(2)}</p>
                      )}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                      trx.status === 'success' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20" :
                      trx.status === 'failed' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-500/20" :
                      "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20"
                    )}>
                      {trx.status === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                       trx.status === 'failed' ? <XCircle className="w-3.5 h-3.5" /> :
                       <Clock className="w-3.5 h-3.5" />}
                      {trx.status}
                    </span>
                    {trx.status === 'failed' && trx.remark && (
                      <p className="text-[10px] text-rose-500 font-medium mt-1.5 line-clamp-2" title={trx.remark}>
                        {trx.remark}
                      </p>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-8 py-5 text-right">
                    <div className="flex flex-row items-center justify-end gap-2">
                      {trx.status !== 'success' && (
                        <button 
                          onClick={() => handleUpdateStatus(trx.id, "success")}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {trx.status !== 'failed' && (
                        <button 
                          onClick={() => handleUpdateStatus(trx.id, "failed")}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                          title={trx.status === 'success' ? 'Revoke' : 'Reject'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {isMounted && (
                        <PDFDownloadLink
                          document={<TransactionInvoicePDF transaction={trx} />}
                          fileName={`invoice-${trx.invoiceNumber || trx.gatewayTrxId || trx.id.substring(0, 8)}.pdf`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </PDFDownloadLink>
                      )}
                    </div>
                  </td>
                </motion.tr>
                {expandedRows[trx.id] && (
                  <tr className="md:hidden bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Payment Details */}
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Payment</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{trx.gateway || 'N/A'}</p>
                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.senderNumber || 'N/A'}</p>
                            {trx.paymentScreenshot && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setScreenshotModalUrl(trx.paymentScreenshot); }}
                                className="mt-1 text-[10px] flex items-center gap-1 font-bold text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                <Eye className="w-3 h-3" /> View Proof
                              </button>
                            )}
                          </div>
                          {/* User */}
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">User</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.userName || 'N/A'}</p>
                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.userEmail || 'N/A'}</p>
                            {trx.userPhone && <p className="text-[11px] font-medium text-gray-500 mt-0.5">{trx.userPhone}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Package */}
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Package</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.packageName || 'Unknown'}</p>
                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.pointsCredited} Pts</p>
                          </div>
                          {/* Amount */}
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Amount</p>
                            {Number(trx.discountAmount) > 0 ? (
                              <div className="flex flex-col">
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳ {Number(trx.amountPaid).toFixed(2)}</p>
                                <span className="inline-flex self-start mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                                  {trx.promoCode} (-৳{Number(trx.discountAmount).toFixed(2)})
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-gray-900 dark:text-white">৳ {Number(trx.amountPaid).toFixed(2)}</p>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Status</p>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                            trx.status === 'success' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20" :
                            trx.status === 'failed' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-500/20" :
                            "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20"
                          )}>
                            {trx.status === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                             trx.status === 'failed' ? <XCircle className="w-3.5 h-3.5" /> :
                             <Clock className="w-3.5 h-3.5" />}
                            {trx.status}
                          </span>
                          {trx.status === 'failed' && trx.remark && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1.5 line-clamp-2">
                              {trx.remark}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                          <p className="text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-widest">Actions</p>
                          <div className="flex flex-row items-center gap-2">
                            {trx.status !== 'success' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(trx.id, "success"); }}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {trx.status !== 'failed' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(trx.id, "failed"); }}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                                title={trx.status === 'success' ? 'Revoke' : 'Reject'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {isMounted && (
                              <PDFDownloadLink
                                document={<TransactionInvoicePDF transaction={trx} />}
                                fileName={`invoice-${trx.invoiceNumber || trx.gatewayTrxId || trx.id.substring(0, 8)}.pdf`}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                                title="Download Invoice"
                                onClick={(e: any) => e.stopPropagation()}
                              >
                                <Download className="w-4 h-4" />
                              </PDFDownloadLink>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                    No transactions found matching your search.
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

      <Dialog open={!!screenshotModalUrl} onOpenChange={(open) => !open && setScreenshotModalUrl(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {screenshotModalUrl && (
              <img src={screenshotModalUrl} alt="Payment Proof" className="max-w-full rounded-xl max-h-[70vh] object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ManualAddModal 
        isOpen={isManualAddOpen} 
        onClose={() => setIsManualAddOpen(false)} 
        packages={packages} 
        promos={promos}
        onSuccess={() => handleApplyFilter(activeFilters)} 
      />

      {/* Reject Modal */}
      <Dialog open={rejectModal.isOpen} onOpenChange={(open) => !open && setRejectModal({ isOpen: false, trxId: null, remark: "", isRevoke: false })}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">{rejectModal.isRevoke ? "Revoke Approval" : "Reject Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                Reason (visible to user) *
              </label>
              <textarea 
                value={rejectModal.remark}
                onChange={(e) => setRejectModal({ ...rejectModal, remark: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[100px] resize-none"
                placeholder={`e.g., ${rejectModal.isRevoke ? 'Transaction revoked due to dispute' : 'Invalid TrxID or mismatched amount'}`}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setRejectModal({ isOpen: false, trxId: null, remark: "", isRevoke: false })}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitReject}
                disabled={!rejectModal.remark.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                Confirm {rejectModal.isRevoke ? "Revoke" : "Reject"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
