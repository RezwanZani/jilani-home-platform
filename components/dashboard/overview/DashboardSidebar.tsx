'use client';
import React, { useState } from "react";
import { Zap, Bell, Ticket, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutModal } from "../store/CheckoutModal";

export function DashboardSidebar({ packages, promo, user }: { packages: any[], promo: any, user: any }) {
  const [selectedPkg, setSelectedPkg] = useState(packages.length > 0 ? packages[0].points : 1000);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const selectedPackageData = packages.find(p => p.points === selectedPkg) || packages[0];

  return (
    <div className="space-y-6">
      {/* Fast Top-Up Card */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Fast Top-Up</h3>
        </div>

        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Choose Package</p>
        <div className="space-y-2 mb-6">
          {packages.length === 0 ? (
            <p className="text-sm text-gray-500">No packages available.</p>
          ) : packages.map((pkg) => (
            <button
              key={pkg.id || pkg.points}
              onClick={() => setSelectedPkg(pkg.points)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                selectedPkg === pkg.points
                  ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-700 dark:text-white shadow-sm"
                  : "bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{pkg.points} Points</span>
                {pkg.isPopular && (
                  <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/30">
                    POPULAR
                  </span>
                )}
              </div>
              <span className="font-bold">৳{pkg.price}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          Launch Checkout
        </button>
      </div>

      {/* Active Promo Highlights */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20 border border-purple-200 dark:border-purple-500/20 shadow-sm rounded-3xl p-6 group cursor-pointer">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Promo Active</h4>
            <p className="text-xs text-gray-600 dark:text-purple-200/70 mb-3 leading-relaxed">
              Use code <strong className="text-purple-600 dark:text-purple-300">{promo.code}</strong> to get {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `৳${promo.discountValue}`} extra points on all packages today.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
              Claim Offer <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick System Alerts */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm rounded-3xl p-6">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-gray-400" />
          System Alerts
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Points payment verified!</p>
              <p className="text-[10px] font-bold text-gray-500 mt-0.5">2 HOURS AGO</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">New premium flat listed in Gulshan.</p>
              <p className="text-[10px] font-bold text-gray-500 mt-0.5">1 DAY AGO</p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        selectedPackage={selectedPackageData} 
        user={user} 
      />
    </div>
  );
}
