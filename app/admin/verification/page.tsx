'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building2,
  MapPin,
  Eye,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OFFICE_IMG = "https://images.unsplash.com/photo-1640109390671-edce15340659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwb2ZmaWNlJTIwc3BhY2UlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3Nzc3MzE4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const HALL_IMG = "https://images.unsplash.com/photo-1763231575952-98244918f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMGhhbGwlMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc3NzMxODczfDA&ixlib=rb-4.1.0&q=80&w=1080";
const PENT_IMG = "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZW50aG91c2UlMjBhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc3NzczMTg3M3ww&ixlib=rb-4.1.0&q=80&w=1080";

type VerifStatus = "pending" | "approved" | "rejected";

interface VerifItem {
  id: number;
  host: string;
  email: string;
  property: string;
  location: string;
  type: string;
  submitted: string;
  status: VerifStatus;
  image: string;
  docs: number;
}

const INITIAL_QUEUE: VerifItem[] = [
  { id: 1, host: "Michael Chen", email: "m.chen@example.com", property: "Shanghai Tower Office", location: "Financial District", type: "Office Space", submitted: "2 hours ago", status: "pending", image: OFFICE_IMG, docs: 3 },
  { id: 2, host: "Olivia Chen", email: "olivia.c@example.com", property: "Lumina Penthouse", location: "Harbor View Tower", type: "Residential", submitted: "1 day ago", status: "pending", image: PENT_IMG, docs: 5 },
  { id: 3, host: "Liu Wei", email: "liu.w@example.com", property: "Riverview Studio Suite", location: "Marina District", type: "Residential", submitted: "2 days ago", status: "pending", image: PENT_IMG, docs: 4 },
  { id: 4, host: "Carlos Rivera", email: "c.rivera@example.com", property: "Downtown Conference Centre", location: "City Centre", type: "Office Space", submitted: "3 days ago", status: "pending", image: OFFICE_IMG, docs: 2 },
  { id: 5, host: "Priya Sharma", email: "p.sharma@example.com", property: "Royal Banquet Hall", location: "Old Town", type: "Event Hall", submitted: "4 days ago", status: "approved", image: HALL_IMG, docs: 6 },
  { id: 6, host: "Alex Johnson", email: "a.johnson@example.com", property: "Fusion Workspace", location: "Tech Park", type: "Office Space", submitted: "1 week ago", status: "rejected", image: OFFICE_IMG, docs: 1 },
];

export default function AdminVerificationPage() {
  const [items, setItems] = useState<VerifItem[]>(INITIAL_QUEUE);
  const [activeFilter, setActiveFilter] = useState<"all" | VerifStatus>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const updateStatus = (id: number, status: VerifStatus) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const filtered = activeFilter === "all" ? items : items.filter((i) => i.status === activeFilter);
  const pending = items.filter((i) => i.status === "pending").length;

  const STATUS_BADGE: Record<VerifStatus, string> = {
    pending: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20",
    approved: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20",
    rejected: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Verification Queue</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Review host identity checks and property listing documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                  activeFilter === f 
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Warning if pending items exist */}
      {pending > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 shadow-sm">
             <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
             </div>
             <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tight">Attention Required</p>
                <p className="text-sm text-amber-700 dark:text-amber-400/80 font-medium mt-0.5">There are {pending} pending verification requests that need immediate review.</p>
             </div>
          </div>
        </motion.div>
      )}

      {/* Verification Cards */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              <GlassCard className="overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm group">
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                  <div className="relative w-full lg:w-48 h-40 lg:h-32 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm">
                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight">{item.property}</h3>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm", STATUS_BADGE[item.status])}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex-wrap">
                          <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-500" />{item.type}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" />{item.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(item.id, "approved")}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(item.id, "rejected")}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                        >
                          <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", expanded === item.id && "rotate-180")} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight flex-wrap bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl w-fit border border-gray-100 dark:border-white/5">
                      <span className="flex items-center gap-2">Host: <span className="text-gray-900 dark:text-white">{item.host}</span></span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                      <span>{item.email}</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                      <span>Submitted {item.submitted}</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 border-t border-gray-50 dark:border-white/5 pt-6 space-y-5">
                        <div className="flex items-center justify-between">
                           <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Documents ({item.docs})</p>
                           <button className="text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Download All ZIP</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: item.docs }).map((_, j) => (
                            <div key={j} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group/doc">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                 <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">Doc_Verification_{j + 1}.pdf</p>
                                <p className="text-[10px] text-gray-400 font-bold">2.4 MB • PDF</p>
                              </div>
                              <Eye className="w-4 h-4 text-gray-300 group-hover/doc:text-blue-500 transition-colors" />
                            </div>
                          ))}
                        </div>
                         <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                              Verification documents include Government ID, Property Ownership Deeds, and Utility Bills. Please cross-reference these with the provided host information.
                            </p>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <GlassCard className="p-20 text-center bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
             <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
             </div>
             <p className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Queue is Empty</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No verification requests found matching your current filter.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
