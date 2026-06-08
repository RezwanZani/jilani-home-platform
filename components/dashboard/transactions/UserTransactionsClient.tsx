"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  ArrowDownUp,
  ArrowDownAZ,
  ArrowUpAZ,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TransactionInvoicePDF } from "@/components/admin/transactions/TransactionInvoicePDF";
import { fetchUserTransactions } from "@/lib/actions/transaction-actions";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClientDataListProps {
  initialData: any;
}

export function UserTransactionsClient({ initialData }: ClientDataListProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const limit = 10;
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("createdAt");

  const [transactions, setTransactions] = useState(initialData.data || []);
  const [hasMoreData, setHasMoreData] = useState(initialData.hasMore || false);
  const [isLoading, setIsLoading] = useState(false);

  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // SERVER-SIDE SEARCH (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search === "" && currentPage === 1 && transactions === initialData.data) return;

      setIsLoading(true);
      const result = await fetchUserTransactions(1, limit, search, sortKey, sortOrder);

      setTransactions(result.data || []);
      setHasMoreData(result.hasMore || false);
      setCurrentPage(1);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, sortKey, sortOrder, limit]);

  // PAGINATION HANDLERS
  const handleNext = async () => {
    if (!hasMoreData || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;
    const result = await fetchUserTransactions(nextPage, limit, search, sortKey, sortOrder);
    setTransactions(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || isLoading) return;
    setIsLoading(true);
    const prevPage = currentPage - 1;
    const result = await fetchUserTransactions(prevPage, limit, search, sortKey, sortOrder);
    setTransactions(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(prevPage);
    setIsLoading(false);
  };

  const handleSort = async (key: string) => {
    if (isLoading) return;
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    setSortKey(key);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Your Transactions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">View your payment history and download receipts.</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by Invoice, TrxID, Package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Transaction
                </th>
                <th className="hidden md:table-cell px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Payment Details
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
              {transactions.map((trx: any, i: number) => (
                <React.Fragment key={trx.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoading ? 0.5 : 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer md:cursor-default"
                    onClick={() => {
                      if (window.innerWidth < 768) toggleRow(trx.id);
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
                          onClick={(e) => { e.stopPropagation(); setScreenshotModalUrl(trx.paymentScreenshot); }}
                          className="mt-1 text-[10px] flex items-center gap-1 font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-3 h-3" /> View Proof
                        </button>
                      )}
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
                            <div>
                              <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Package</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.packageName || 'Unknown'}</p>
                              <p className="text-[11px] font-bold text-gray-400 mt-0.5">{trx.pointsCredited} Pts</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
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
                          </div>

                          <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-widest">Actions</p>
                            <div className="flex flex-row items-center gap-2">
                              {isMounted && (
                                <PDFDownloadLink
                                  document={<TransactionInvoicePDF transaction={trx} />}
                                  fileName={`invoice-${trx.invoiceNumber || trx.gatewayTrxId || trx.id.substring(0, 8)}.pdf`}
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                                  title="Download Invoice"
                                  onClick={(e: any) => e.stopPropagation()}
                                >
                                  <Download className="w-4 h-4" /> Download Receipt
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
                    No transactions found. Make a purchase to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 rounded-b-xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Page {currentPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1 || isLoading}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!hasMoreData || isLoading}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </GlassCard>

      <Dialog open={!!screenshotModalUrl} onOpenChange={() => setScreenshotModalUrl(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 dark:border-white/5">
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {screenshotModalUrl && (
            <div className="p-4">
              <img src={screenshotModalUrl} alt="Payment Proof" className="w-full h-auto max-h-[60vh] object-contain rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
