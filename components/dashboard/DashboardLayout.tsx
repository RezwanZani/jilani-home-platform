'use client';

import { useUser } from "@/components/providers/UserProvider";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  Heart,
  Settings,
  Users,
  BarChart3,
  Building2,
  LogOut,
  LayoutDashboard,
  CheckCircle,
  Menu,
  Bell,
  Search,
  MapPinned,
  UserCheck,
  DollarSign,
  Ticket,
  BadgeDollarSign,
  Coins,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useUser();

  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLinks = [
    { name: "Overview", path: "/dashboard", icon: Home },
    { name: "Explore", path: "/dashboard/explore", icon: Compass },
    { name: "Your Listings", path: "/dashboard/saved", icon: Heart },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Properties", path: "/admin/properties", icon: Building2 },
    { name: "Owners", path: "/admin/owners", icon: UserCheck },
    { name: "Zones", path: "/admin/zones", icon: MapPinned },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Packages", path: "/admin/packages", icon: Coins },
    { name: "Transactions", path: "/admin/transactions", icon: BadgeDollarSign },
    { name: "Promo Code", path: "/admin/promos", icon: Ticket },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Verification", path: "/admin/verification", icon: CheckCircle },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  // Site's primary brand color
  const brandBlue = "#3B82F6";
  const brandGradient = "from-[#3B82F6] to-[#60A5FA]";

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-6">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-blue-500/20",
          brandGradient
        )}>
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg leading-tight text-gray-900 dark:text-white tracking-tight">
            Jilani Home
          </h1>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-primary/20 text-primary tracking-widest bg-primary/5">
            {isAdmin ? "Admin Portal" : "User Portal"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        <p className="text-[11px] font-bold tracking-[0.1em] text-gray-400 dark:text-gray-500 uppercase px-3 mb-4">
          Main Menu
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path || (link.path !== "/dashboard" && link.path !== "/admindashboard" && pathname.startsWith(link.path));
          return (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold group relative overflow-hidden",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-full"
                />
              )}
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="pt-6 border-t border-gray-100 dark:border-white/10 mt-6 space-y-5">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.image || '/avatar-default.png'}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 dark:border-white/15 flex-shrink-0"
          />
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              {!isAdmin && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-[11px] font-medium text-gray-500 truncate">
              {user?.email || user?.phoneNumber || "Member"}
            </p>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-bold"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 flex font-sans overflow-hidden">

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex-shrink-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-white/5 flex flex-col shadow-xl md:shadow-none">
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 text-sm w-80 group focus-within:border-blue-500/50 transition-all">
              <Search className="w-4.5 h-4.5 flex-shrink-0 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search properties, users, etc..."
                className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white dark:border-[#1E293B] rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{user?.name}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{user?.role === 'user' ? 'Member' : 'Admin'}</p>
              </div>
              <img
                src={user?.image || '/avatar-default.png'}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/20 p-0.5"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
