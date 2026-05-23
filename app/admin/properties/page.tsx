'use client';

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  Upload,
  FileSpreadsheet,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PropertyForm from "@/components/dashboard/PropertyForm";
import { toast } from "sonner";

const OFFICE_IMG = "https://images.unsplash.com/photo-1640109390671-edce15340659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwb2ZmaWNlJTIwc3BhY2UlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3Nzc3MzE4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const HALL_IMG = "https://images.unsplash.com/photo-1763231575952-98244918f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMGhhbGwlMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc3NzMxODczfDA&ixlib=rb-4.1.0&q=80&w=1080";
const PENT_IMG = "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZW50aG91c2UlMjBhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc3NzczMTg3M3ww&ixlib=rb-4.1.0&q=80&w=1080";

const INITIAL_PROPERTIES = [
  { id: 1, title: "The Glass House Office", location: "Downtown Metropolis", type: "Office Space", price: "$2,400/mo", status: "active", views: 1240, host: "Marcus Rivera", image: OFFICE_IMG, date: "Jan 12, 2026" },
  { id: 2, title: "Skyline Event Hall", location: "Westside District", type: "Event Hall", price: "$850/day", status: "active", views: 892, host: "Priya Sharma", image: HALL_IMG, date: "Jan 18, 2026" },
  { id: 3, title: "Lumina Penthouse", location: "Harbor View Tower", type: "Residential", price: "$6,200/mo", status: "pending", views: 654, host: "Olivia Chen", image: PENT_IMG, date: "Feb 3, 2026" },
  { id: 4, title: "Nova Co-Working Space", location: "Innovation Quarter", type: "Office Space", price: "$350/mo", status: "active", views: 2103, host: "James Park", image: OFFICE_IMG, date: "Feb 10, 2026" },
  { id: 5, title: "Crystal Ballroom", location: "Grand Central Ave", type: "Event Hall", price: "$1,200/day", status: "suspended", views: 345, host: "Eva Martinez", image: HALL_IMG, date: "Feb 22, 2026" },
  { id: 6, title: "Riverview Studio Suite", location: "Marina District", type: "Residential", price: "$3,800/mo", status: "pending", views: 487, host: "Liu Wei", image: PENT_IMG, date: "Mar 5, 2026" },
];

type Status = "active" | "pending" | "suspended" | "inactive" | "expired";

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; classes: string }> = {
  active: { label: "Active", icon: CheckCircle, classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20" },
  pending: { label: "Pending", icon: Clock, classes: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20" },
  suspended: { label: "Suspended", icon: XCircle, classes: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-500/20" },
  inactive: { label: "Inactive", icon: XCircle, classes: "text-gray-500 bg-gray-50 dark:bg-white/5 border-gray-500/20" },
  expired: { label: "Expired", icon: Clock, classes: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-500/20" },
};

// Mock data definitions matching PropertyForm to handle zone and owner resolving
const ZONES_LOOKUP: Record<number, string> = {
  1: "Mirpur, Dhaka",
  2: "Dhanmondi, Dhaka",
  3: "Gulshan, Dhaka",
  4: "Banani, Dhaka",
  5: "Uttara, Dhaka",
  6: "Mohammadpur, Dhaka",
  7: "Badda, Dhaka",
  8: "Bashundhara, Dhaka"
};

const USERS_LOOKUP: Record<string, string> = {
  "8f845ac8-596e-468c-9dd1-9d0b368fdd41": "Marcus Rivera",
  "f4208fe8-6efc-4f16-b475-e7888cd8fe8b": "Priya Sharma",
  "36b7a1ca-3922-4ef6-b984-9f09ad9529b3": "Olivia Chen",
  "5f854070-45c8-4bb2-a41e-6ef9633ca9da": "James Park",
  "2bb4c853-2eef-484a-8124-78ab8f370ffb": "Eva Martinez",
  "7b25bd93-9bdd-42f6-a78b-1939a3ac407a": "Liu Wei"
};

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);

  const handleAddPropertySuccess = (newProp: any) => {
    // Resolve location and owner
    const zoneIdNum = Number(newProp.zoneId);
    const locationName = ZONES_LOOKUP[zoneIdNum] || "Dhaka, Bangladesh";
    const hostName = USERS_LOOKUP[newProp.ownerId] || "Verified Host";

    // Format type text for UI
    const typeLabel = newProp.type === "house" ? "Residential" : newProp.type === "office" ? "Office Space" : "Event Hall";

    const newItem = {
      id: properties.length + 1,
      title: newProp.title,
      location: locationName,
      type: typeLabel,
      price: `৳${newProp.price}`,
      status: newProp.status,
      views: 0,
      host: hostName,
      image: newProp.coverImage || OFFICE_IMG,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setProperties([newItem, ...properties]);
    toast.success(`Property "${newProp.title}" listed successfully!`);
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.host.toLowerCase().includes(search.toLowerCase()) ||
    (p.type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase">Management</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Manage and review all platform listings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4.5 h-4.5" />
            Bulk Upload
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Property
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
            placeholder="Search by ID, name, host, or location..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
          <Filter className="w-5 h-5" />
          Advanced Filter
        </button>
      </div>

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                {["Property", "Type", "Host", "Price", "Views", "Status", "Listed", ""].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      {h} {h && h !== "" && <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredProperties.map((p, i) => {
                const sc = STATUS_CONFIG[p.status as Status] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{p.title}</p>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tighter">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {p.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <Building2 className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        {p.type}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{p.host}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Verified Host</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold text-gray-900 dark:text-white">{p.price}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400">{p.views.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm", sc.classes)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{p.date}</td>
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
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filteredProperties.length} of {properties.length} Results</p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 transition-all">Prev</button>
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase hover:bg-gray-50 transition-all">Next</button>
           </div>
        </div>
      </GlassCard>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl z-10 p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload</h3>
                <button onClick={() => setIsUploadOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="border-3 border-dashed border-gray-100 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Spreadsheet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">CSV or Excel files accepted (max 25MB)</p>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setIsUploadOpen(false)} className="flex-1 py-4 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                <button className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all cursor-pointer">Upload File</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Form slide-out panel */}
      <PropertyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleAddPropertySuccess}
      />
    </div>
  );
}

