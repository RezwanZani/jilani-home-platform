"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
    Search,
    MoreVertical,
    Filter,
    Loader2,
    ArrowDownUp,
    ArrowDownAZ,
    ArrowUpAZ,
    Edit3, Trash2, Mail, Phone, Coins, Shield,
    Plus,
    ArrowDown01,
    ArrowUp10,
    ArrowUp01
} from "lucide-react";
import UserFormModal from "./UserFormModal";
import AdvancedFilter from "./AdvancedFilter";
import { fetchUsers, deleteUser, deleteMultipleUsers } from "@/lib/actions/user-actions";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersClientProps {
    initialData: any[];
    limit: number;
    hasMore: boolean;
}

export default function UsersClient({ initialData = [], limit = 10, hasMore = false }: UsersClientProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortKey, setSortKey] = useState("createdAt");

    const [UsersList, setUsersList] = useState(initialData);
    const [hasMoreData, setHasMoreData] = useState(hasMore);
    const [isLoading, setIsLoading] = useState(false);

    const [UserToEdit, setUserToEdit] = useState<any | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ role: "all" });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Debounced Search & Filter
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (search === "" && currentPage === 1 && UsersList === initialData && activeFilters.role === "all") return;

            setIsLoading(true);
            const result = await fetchUsers(1, limit, search, sortKey, sortOrder, activeFilters);
            setUsersList(result.data || []);
            setHasMoreData(result.hasMore || false);
            setCurrentPage(1);
            setIsLoading(false);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [search, limit, activeFilters]);

    const refreshData = async () => {
        setIsLoading(true);
        const result = await fetchUsers(currentPage, limit, search, sortKey, sortOrder, activeFilters);
        setUsersList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setIsLoading(false);
    };

    const handleNext = async () => {
        if (!hasMoreData || isLoading) return;
        setIsLoading(true);
        const nextPage = currentPage + 1;
        const result = await fetchUsers(nextPage, limit, search, sortKey, sortOrder, activeFilters);
        setUsersList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setCurrentPage(nextPage);
        setIsLoading(false);
    };

    const handlePrev = async () => {
        if (currentPage <= 1 || isLoading) return;
        setIsLoading(true);
        const prevPage = currentPage - 1;
        const result = await fetchUsers(prevPage, limit, search, sortKey, sortOrder, activeFilters);
        setUsersList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setCurrentPage(prevPage);
        setIsLoading(false);
    };

    const handleSort = async (newSortKey: string) => {
        if (isLoading) return;
        const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
        setSortOrder(newSortOrder);
        setSortKey(newSortKey);

        setIsLoading(true);
        const result = await fetchUsers(currentPage, limit, search, newSortKey, newSortOrder, activeFilters);
        setUsersList(result.data || []);
        setHasMoreData(result.hasMore || false);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            const result = await deleteUser(id);
            if (result.success) setUsersList(prev => prev.filter(u => u.id !== id));
            else alert(result.error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} users?`)) return;
        setIsBulkDeleting(true);
        const result = await deleteMultipleUsers(selectedIds);
        if (result.success) {
            setUsersList((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
            setSelectedIds([]);
        } else alert(result.error);
        setIsBulkDeleting(false);
    };

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Accounts Management</p>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">System Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base">Manage admins, owners, users, and their point balances.</p>
                </div>

                {/* ADD THIS DIV to hold the Add User button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setUserToEdit(null); setIsFormOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        Add User
                    </button>
                </div>
            </motion.div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or phone..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
                    />
                    {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                </div>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                    Filter Role
                </button>
            </div>

            <AdvancedFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={activeFilters}
                onApply={setActiveFilters}
            />

            <UserFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={UserToEdit}
                onSuccess={refreshData}
            />

            {/* BULK ACTION */}
            {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 mb-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">{selectedIds.length}</span>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Users Selected</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button onClick={() => setSelectedIds([])} className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors">Cancel</button>
                        <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50">
                            {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Selected
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Table */}
            <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <th className="px-6 py-5 text-left w-12">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={selectedIds.length === UsersList.length && UsersList.length > 0} onChange={() => setSelectedIds(selectedIds.length === UsersList.length ? [] : UsersList.map(u => u.id))} />
                                </th>
                                <th onClick={() => handleSort("name")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        User {sortKey !== "name" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpAZ className="w-3.5 h-3.5" />}
                                    </span>
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Contact</th>
                                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                                <th onClick={() => handleSort("pointsBalance")} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        Wallet {sortKey !== "pointsBalance" ? <ArrowDownUp className="w-3.5 h-3.5 opacity-30" /> : sortOrder === "desc" ? <ArrowDown01 className="w-3.5 h-3.5" /> : <ArrowUp01 className="w-3.5 h-3.5" />}
                                    </span>
                                </th>
                                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {UsersList.map((user, i) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isLoading ? 0.5 : 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-5 w-12">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-gray-100 dark:bg-gray-800 dark:border-gray-600" checked={selectedIds.includes(user.id)} onChange={() => setSelectedIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} />
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <img src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'U'}`} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 object-cover" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name || "Unnamed User"}</p>
                                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{user.phoneNumber || "N/A"}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                            user.role === 'admin' ? "text-purple-600 bg-purple-50 border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400" :
                                                user.role === 'owner' ? "text-blue-600 bg-blue-50 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400" :
                                                    "text-gray-600 bg-gray-50 border-gray-500/20 dark:bg-white/5 dark:text-gray-400"
                                        )}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.pointsBalance} pts</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer outline-none">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1">
                                                <DropdownMenuItem onClick={() => { setUserToEdit(user); setIsFormOpen(true); }} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 focus:text-gray-900 dark:focus:text-white">
                                                    <Edit3 className="w-4 h-4 mr-2 text-blue-500" /> Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="px-3 py-2 text-sm font-medium text-red-600 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-500">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}
                            {UsersList.length === 0 && !isLoading && (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-500 dark:text-gray-400 font-medium">No users found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page {currentPage}</p>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} disabled={currentPage === 1 || isLoading} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Prev
                        </button>
                        <button onClick={handleNext} disabled={!hasMoreData || isLoading} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
