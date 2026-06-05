"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Trash2,
  Star,
  MessageSquare,
  ShieldCheck,
  Ban,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { fetchReviews, updateReviewStatus, bulkUpdateReviewStatus, deleteReview, bulkDeleteReviews } from "@/lib/actions/review-actions";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientDataListProps {
  initialData: any[];
  limit: number;
  hasMore: boolean;
}

export default function ReviewsClient({ initialData, limit, hasMore }: ClientDataListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState(initialData);
  const [hasMoreData, setHasMoreData] = useState(hasMore);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  const toggleMessage = (id: string) => {
    setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // SERVER-SIDE SEARCH (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search === "" && statusFilter === "all" && currentPage === 1 && reviews === initialData) return;

      setIsLoading(true);
      const result = await fetchReviews(1, limit, search, statusFilter);
      setReviews(result.data || []);
      setHasMoreData(result.hasMore || false);
      setCurrentPage(1);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, limit]);

  // PAGINATION HANDLERS
  const handleNext = async () => {
    if (!hasMoreData || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;
    const result = await fetchReviews(nextPage, limit, search, statusFilter);
    setReviews(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (currentPage <= 1 || isLoading) return;
    setIsLoading(true);
    const prevPage = currentPage - 1;
    const result = await fetchReviews(prevPage, limit, search, statusFilter);
    setReviews(result.data || []);
    setHasMoreData(result.hasMore || false);
    setCurrentPage(prevPage);
    setIsLoading(false);
  };

  // ROW ACTIONS
  const handleStatusChange = async (id: string, propertyId: string, status: "approved" | "rejected" | "pending") => {
    try {
      setIsLoading(true);
      await updateReviewStatus(id, propertyId, status);
      // Optimistic update locally
      setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, propertyId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone and will recalculate the property's average rating.")) return;
    try {
      setIsLoading(true);
      await deleteReview(id, propertyId);
      setReviews(reviews.filter(r => r.id !== id));
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } catch (error) {
      alert("Failed to delete review");
    } finally {
      setIsLoading(false);
    }
  };

  // BULK SELECTION
  const [selectedItems, setSelectedItems] = useState<{ id: string, propertyId: string }[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const toggleSelectAll = () => {
    if (selectedItems.length === reviews.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(reviews.map(r => ({ id: r.id, propertyId: r.propertyId })));
    }
  };

  const toggleSelect = (id: string, propertyId: string) => {
    if (selectedItems.find(i => i.id === id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== id));
    } else {
      setSelectedItems([...selectedItems, { id, propertyId }]);
    }
  };

  // BULK ACTIONS
  const handleBulkStatusChange = async (status: "approved" | "rejected") => {
    if (selectedItems.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await bulkUpdateReviewStatus(selectedItems, status);
      const selectedIds = selectedItems.map(i => i.id);
      setReviews(reviews.map(r => selectedIds.includes(r.id) ? { ...r, status } : r));
      setSelectedItems([]);
    } catch (error) {
      alert("Failed to perform bulk update.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} reviews?`)) return;
    setIsBulkProcessing(true);
    try {
      await bulkDeleteReviews(selectedItems);
      const selectedIds = selectedItems.map(i => i.id);
      setReviews(reviews.filter(r => !selectedIds.includes(r.id)));
      setSelectedItems([]);
    } catch (error) {
      alert("Failed to perform bulk delete.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // RENDER STARS Helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={cn(
              "w-3.5 h-3.5",
              star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10"
            )} 
          />
        ))}
        <span className="ml-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300">{rating}.0</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto relative">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Moderation</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Review Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Approve or deny property reviews to maintain quality.</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or property..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium w-full"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>
        <div className="w-full md:w-64 flex-shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full px-6 py-4 h-[58px] rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm font-bold text-gray-700 dark:text-gray-300">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BULK ACTION TOOLBAR */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 pr-4 border-r border-white/20 dark:border-gray-900/20">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {selectedItems.length}
              </span>
              <span className="text-sm font-medium">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('approved')}
                disabled={isBulkProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white dark:bg-gray-900/5 dark:hover:bg-emerald-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleBulkStatusChange('rejected')}
                disabled={isBulkProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-white dark:bg-gray-900/5 dark:hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Ban className="w-4 h-4" /> Deny
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white dark:bg-gray-900/5 dark:hover:bg-rose-500 transition-colors text-sm font-medium text-rose-400 dark:text-rose-600 hover:text-white disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            {isBulkProcessing && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5 text-left w-12">
                  <input
                    type="checkbox"
                    checked={reviews.length > 0 && selectedItems.length === reviews.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:border-white/20"
                  />
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Reviewer
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Property
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Rating
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Message
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {reviews.map((review, i) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0.5 : 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group",
                    selectedItems.find(item => item.id === review.id) && "bg-blue-50/50 dark:bg-blue-500/10"
                  )}
                >
                  <td className="px-8 py-5">
                    <input
                      type="checkbox"
                      checked={!!selectedItems.find(item => item.id === review.id)}
                      onChange={() => toggleSelect(review.id, review.propertyId)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:border-white/20"
                    />
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{review.userName || 'Anonymous'}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{review.userEmail || 'N/A'}</p>
                  </td>
                  <td className="px-8 py-5 max-w-[200px]">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={review.propertyTitle}>
                      {review.propertyTitle || 'Unknown Property'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-5 w-1/3 min-w-[200px] max-w-[350px]">
                    <div className="flex items-start gap-2 group/message">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm text-gray-600 dark:text-gray-300 transition-all",
                          !expandedMessages[review.id] && "line-clamp-2"
                        )}>
                          {review.message || <span className="italic text-gray-400">No written review.</span>}
                        </p>
                        {review.message && review.message.length > 80 && (
                          <button 
                            onClick={() => toggleMessage(review.id)}
                            className="text-[10px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                          >
                            {expandedMessages[review.id] ? (
                              <>Show Less <ChevronUp className="w-3 h-3" /></>
                            ) : (
                              <>Read More <ChevronDown className="w-3 h-3" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                      review.status === 'approved' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20" :
                      review.status === 'rejected' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-500/20" :
                      "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20"
                    )}>
                      {review.status === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                       review.status === 'rejected' ? <Ban className="w-3.5 h-3.5" /> :
                       <Clock className="w-3.5 h-3.5" />}
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right w-16 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors outline-none">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 shadow-xl rounded-2xl p-2">
                        <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">
                          Change Status
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, review.propertyId, 'approved')} className="text-sm font-medium rounded-xl focus:bg-emerald-50 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 cursor-pointer flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, review.propertyId, 'pending')} className="text-sm font-medium rounded-xl focus:bg-amber-50 focus:text-amber-600 dark:focus:bg-amber-500/10 dark:focus:text-amber-400 cursor-pointer flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(review.id, review.propertyId, 'rejected')} className="text-sm font-medium rounded-xl focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-500/10 dark:focus:text-rose-400 cursor-pointer flex items-center gap-2">
                          <Ban className="w-4 h-4" /> Deny
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10 my-2" />
                        <DropdownMenuItem onClick={() => handleDelete(review.id, review.propertyId)} className="text-sm font-medium text-red-600 dark:text-red-400 rounded-xl focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-500/10 cursor-pointer flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              {reviews.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-500">
                    No reviews found matching your search.
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
