'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  ArrowUpDown,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const USERS = [
  { id: 1, name: "Marcus Rivera", email: "m.rivera@example.com", role: "Host", status: "active", joined: "Jan 12, 2026", listings: 12 },
  { id: 2, name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Client", status: "active", joined: "Jan 15, 2026", listings: 0 },
  { id: 3, name: "Olivia Chen", email: "olivia.c@example.com", role: "Host", status: "pending", joined: "Feb 03, 2026", listings: 4 },
  { id: 4, name: "James Park", email: "j.park@example.com", role: "Host", status: "active", joined: "Feb 10, 2026", listings: 8 },
  { id: 5, name: "Emma Wilson", email: "emma.w@example.com", role: "Client", status: "suspended", joined: "Feb 22, 2026", listings: 0 },
  { id: 6, name: "David Smith", email: "d.smith@example.com", role: "Client", status: "active", joined: "Mar 05, 2026", listings: 0 },
];

type Status = "active" | "pending" | "suspended";

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; classes: string }> = {
  active: { label: "Active", icon: CheckCircle, classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20" },
  pending: { label: "Pending", icon: Clock, classes: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20" },
  suspended: { label: "Suspended", icon: XCircle, classes: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-500/20" },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">User Accounts</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">System Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Manage permissions, verification, and activity of all users.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
          <UserPlus className="w-4.5 h-4.5" />
          Invite New User
        </button>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
            {["All", "Host", "Client"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                  roleFilter === r 
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {r}s
              </button>
            ))}
          </div>
          <button className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                {["User Details", "Role", "Status", "Listings", "Joined", ""].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      {h} {h && h !== "" && <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((u, i) => {
                const sc = STATUS_CONFIG[u.status as Status];
                const StatusIcon = sc.icon;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-sm uppercase shadow-sm border border-blue-100/50 dark:border-blue-500/20">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                            {u.name}
                            {u.status === "active" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 tracking-tight">
                            <Mail className="w-3 h-3 text-blue-500" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                        <Shield className={cn("w-4 h-4", u.role === "Host" ? "text-indigo-500" : "text-emerald-500")} />
                        <span className={u.role === "Host" ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm", sc.classes)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      {u.listings > 0 ? (
                        <div className="flex items-center gap-1.5">
                           {u.listings}
                           <span className="text-[10px] text-gray-400 font-bold uppercase">Listings</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{u.joined}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filtered.length} Users</p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 transition-all">Prev</button>
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 transition-all">Next</button>
           </div>
        </div>
      </GlassCard>
    </div>
  );
}
