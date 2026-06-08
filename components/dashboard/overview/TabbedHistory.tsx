'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TabbedHistory({ savedSpaces, inquiries }: { savedSpaces: any[], inquiries: any[] }) {
  const [activeTab, setActiveTab] = useState<"saved" | "inquiries">("saved");

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm rounded-3xl p-6 md:p-8">
      <div className="flex border-b border-gray-200 dark:border-white/[0.06] mb-6">
        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "pb-4 px-4 text-sm font-bold transition-colors relative",
            activeTab === "saved" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          )}
        >
          Saved Listings ({savedSpaces.length})
          {activeTab === "saved" && (
            <motion.div layoutId="historyTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={cn(
            "pb-4 px-4 text-sm font-bold transition-colors relative",
            activeTab === "inquiries" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          )}
        >
          Recent Inquiries ({inquiries.length})
          {activeTab === "inquiries" && (
            <motion.div layoutId="historyTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
      </div>

      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          {activeTab === "saved" ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {savedSpaces.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved properties.</p>
              ) : savedSpaces.map((space) => {
                const prop = space.data;
                const isUnlocked = !!space.unlockedId;

                return (
                  <Link href={`/listings/${prop.slug}`} key={prop.id} className="group p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:bg-white dark:hover:bg-white/[0.04] transition-colors cursor-pointer hover:border-blue-500/30">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Unlock Active
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{prop.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{space.zone?.area || space.zone?.city} • {prop.averageRating} ★</p>
                  </Link>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="inquiries"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {inquiries.length === 0 ? (
                <p className="text-gray-500 text-sm">No inquiries found.</p>
              ) : inquiries.map((inq) => (
                <div key={inq.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/[0.05] flex items-center justify-center border border-gray-200 dark:border-transparent">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">Inquiry for Property</h4>
                      <p className="text-xs text-gray-500">{new Date(inq.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border",
                      inq.status === "contacted" ? "text-emerald-600 dark:text-emerald-400 border-emerald-400/20 bg-emerald-400/10" :
                      inq.status === "pending" ? "text-amber-600 dark:text-amber-400 border-amber-400/20 bg-amber-400/10" :
                      "text-gray-600 dark:text-gray-400 border-gray-400/20 bg-gray-400/10"
                    )}>
                      {inq.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
