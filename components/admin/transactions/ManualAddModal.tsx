"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminCreateTransaction, searchUsersForManualAdd } from "@/lib/actions/transaction-actions";
import { Check, CheckCircle, XCircle } from "lucide-react";

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: any[];
  promos?: any[];
  onSuccess: () => void;
}

export function ManualAddModal({ isOpen, onClose, packages, promos = [], onSuccess }: ManualAddModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [packageId, setPackageId] = useState("");
  const [gateway, setGateway] = useState("");
  const [gatewayTrxId, setGatewayTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeId, setPromoCodeId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!packageId) {
      setAmountPaid("");
      setPromoCodeId("");
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    let originalAmount = Number(pkg.price);
    let discountAmount = 0;
    let currentPromoId = "";

    if (promoCodeInput.trim()) {
      const promo = promos.find(p => p.code.toLowerCase() === promoCodeInput.trim().toLowerCase());
      if (promo) {
        currentPromoId = promo.id;
        if (promo.discountType === 'percentage') {
          discountAmount = (originalAmount * Number(promo.discountValue)) / 100;
        } else {
          discountAmount = Number(promo.discountValue);
        }
        if (discountAmount > originalAmount) discountAmount = originalAmount;
      }
    }

    setPromoCodeId(currentPromoId);
    setAmountPaid(String(originalAmount - discountAmount));
  }, [packageId, promoCodeInput, packages, promos]);

  const handleSearchUser = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setUserId(null);
    setSelectedUser(null);
    setSearchResults([]);
    const res = await searchUsersForManualAdd(searchQuery);
    setIsSearching(false);
    if (res.success && res.users && res.users.length > 0) {
      if (res.users.length === 1) {
        setUserId(res.users[0].id);
        setSelectedUser(res.users[0]);
        toast.success(`Found User: ${res.users[0].name}`);
      } else {
        setSearchResults(res.users);
      }
    } else {
      toast.error(res.error || "User not found");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !packageId || !gateway || !gatewayTrxId || !amountPaid || !senderNumber) {
      return toast.error("Please fill all required fields");
    }

    setIsSubmitting(true);
    const res = await adminCreateTransaction({
      userId,
      packageId,
      gateway,
      gatewayTrxId,
      senderNumber,
      promoCodeId: promoCodeId || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Transaction added successfully");
      onSuccess();
      onClose();
      // Reset
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
      setUserId(null);
      setPackageId("");
      setGateway("");
      setGatewayTrxId("");
      setSenderNumber("");
      setAmountPaid("");
      setPromoCodeInput("");
      setPromoCodeId("");
    } else {
      toast.error(res.error || "Failed to add transaction");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Manual Add Transaction</DialogTitle>
          <DialogDescription>
            Create a successful transaction manually. Points will be credited immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 relative">
            <Label>User (Email, Phone or Name) *</Label>

            {!selectedUser ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                    placeholder="Enter email, phone or name"
                    className="bg-white dark:bg-black/20"
                    required
                  />
                  <Button type="button" onClick={handleSearchUser} disabled={isSearching || !searchQuery} variant="secondary">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                    {searchResults.map(u => (
                      <div
                        key={u.id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => {
                          setUserId(u.id);
                          setSelectedUser(u);
                          setSearchResults([]);
                        }}
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">{u.email} • {u.phone || 'No Phone'}</p>
                        </div>
                        <Button type="button" size="sm" variant="outline" className="text-[10px] h-7 px-2 border-blue-200 text-blue-600 hover:bg-blue-50">Select</Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> {selectedUser.name}
                  </p>
                  <p className="text-[11px] font-medium text-blue-600/70 dark:text-blue-400/70 mt-0.5 pl-6">
                    {selectedUser.email} • {selectedUser.phone || 'No Phone'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-xs h-8 px-3"
                  onClick={() => { setUserId(null); setSelectedUser(null); setSearchQuery(""); }}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Package *</Label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20"
                required
              >
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ৳{p.price}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 relative">
              <Label>Promo Code</Label>
              <Input
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                placeholder="e.g. WELCOME20"
                className="w-full h-10 bg-white dark:bg-black/20 uppercase"
              />
              {promoCodeInput.trim() && (
                <div className="absolute right-3 top-[34px]">
                  {promoCodeId ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Amount Paid (Auto-Calculated) *</Label>
            <Input
              type="number"
              value={amountPaid}
              readOnly
              placeholder="0"
              className="bg-gray-50 dark:bg-black/40 text-gray-500 font-bold border-gray-200 dark:border-white/5 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Payment Method *</Label>
              <select
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20"
                required
              >
                <option value="">Select Method</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Sender Number *</Label>
              <Input
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 01700000000"
                className="bg-white dark:bg-black/20"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Transaction ID *</Label>
            <Input
              value={gatewayTrxId}
              onChange={(e) => setGatewayTrxId(e.target.value)}
              placeholder="e.g. MNL-12345"
              className="bg-white dark:bg-black/20 uppercase"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !userId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
