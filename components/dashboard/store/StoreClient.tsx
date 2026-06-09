"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Check, X, Shield, ArrowRight, Tag, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckoutModal } from "./CheckoutModal";

interface StoreClientProps {
  packages: any[];
  user: any;
}

export default function StoreClient({ packages, user }: StoreClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Coins className="w-8 h-8 text-blue-500" />
          Get Points
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
          Purchase points to unlock exclusive property contact details. Choose a package below that suits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={pkg.id}
            className={`relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800/50 border transition-all duration-300 flex flex-col ${pkg.isPopular
              ? "border-blue-500 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 scale-100 lg:scale-105 z-10"
              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg"
              }`}
          >
            {pkg.isPopular && (
              <div className="absolute top-0 left-0 w-full bg-blue-500 text-white keep-white text-[10px] uppercase tracking-widest font-bold py-1.5 text-center">
                Most Popular
              </div>
            )}

            <div className={`p-8 pb-6 flex-1 flex flex-col ${pkg.isPopular ? "pt-12" : ""}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
              {pkg.name_bn && <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali mb-4">{pkg.name_bn}</p>}

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-heading font-black text-gray-900 dark:text-white">
                  ৳{Number(pkg.price).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-700 dark:text-blue-300">{pkg.points} Points</span>
              </div>

              {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex flex-shrink-0 items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{f.text}</span>
                        {f.text_bn && <span className="text-xs text-gray-500 dark:text-gray-500 font-bengali">{f.text_bn}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full py-6 text-base font-bold rounded-xl mt-auto ${pkg.isPopular
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                  : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
              >
                Purchase Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>


      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedPackage={selectedPackage} 
        user={user} 
      />
    </div>
  );
}
