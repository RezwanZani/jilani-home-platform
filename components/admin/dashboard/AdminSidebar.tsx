import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoreHorizontal, Wallet, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminSidebarProps {
  recentTxs: {
    id: string;
    amount: string;
    status: string;
    createdAt: Date;
    userName: string | null;
  }[];
  pendingApprovals: number;
}

export function AdminSidebar({ recentTxs, pendingApprovals }: AdminSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Payouts/Transactions Card */}
      <GlassCard className="p-6 bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentTxs.map((item) => {
            const isSuccess = item.status === "success";
            const isPending = item.status === "pending";
            const color = isSuccess ? "text-emerald-600 dark:text-emerald-500" : isPending ? "text-amber-600 dark:text-amber-500" : "text-rose-600 dark:text-rose-500";
            const bg = isSuccess ? "bg-emerald-100 dark:bg-emerald-500/10" : isPending ? "bg-amber-100 dark:bg-amber-500/10" : "bg-rose-100 dark:bg-rose-500/10";
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                    <Wallet className="w-4.5 h-4.5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">৳{Number(item.amount).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-500 mt-0.5 uppercase tracking-tight truncate max-w-[100px]">{item.userName || "Unknown User"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-current", color, bg)}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
          {recentTxs.length === 0 && (
            <p className="text-center text-sm text-gray-500">No recent transactions</p>
          )}
        </div>
        
        <Link href="/admin/transactions" className="block">
          <button className="w-full mt-5 py-3 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 text-blue-600 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all">
            View All Transactions
          </button>
        </Link>
      </GlassCard>

      {/* System Health Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border border-gray-200 dark:border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">System Health</h3>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
          </div>
          
          <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending Approvals</span>
                <span className={cn("text-xs font-bold", pendingApprovals > 0 ? "text-amber-500" : "text-gray-900 dark:text-white")}>{pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Database Sync</span>
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">VERIFIED</span>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-2">
                Run Diagnostics <ArrowRight className="w-3 h-3" />
              </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
