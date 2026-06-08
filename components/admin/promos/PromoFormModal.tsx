"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPromoCode, updatePromoCode } from "@/lib/actions/promo-actions";

interface PromoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export default function PromoFormModal({ isOpen, onClose, initialData }: PromoFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: "",
    maxUsesPerUser: "",
    validUntil: "",
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      let formattedDate = "";
      if (initialData?.validUntil) {
        const d = new Date(initialData.validUntil);
        formattedDate = d.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input type="date"
      }
      
      setFormData({
        code: initialData?.code || "",
        discountType: initialData?.discountType || "percentage",
        discountValue: initialData?.discountValue || "",
        maxUses: initialData?.maxUses || "",
        maxUsesPerUser: initialData?.maxUsesPerUser || "",
        validUntil: formattedDate,
        isActive: initialData ? initialData.isActive : true,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discountType || !formData.discountValue) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (initialData) {
      result = await updatePromoCode(initialData.id, formData);
    } else {
      result = await createPromoCode(formData);
    }

    if (result.success) {
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxUses: "",
        maxUsesPerUser: "",
        validUntil: "",
        isActive: true,
      });
      setIsSubmitting(false);
      onClose();
      toast.success(initialData ? "Promo code updated successfully" : "Promo code added successfully");
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Failed to save promo code");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initialData ? "Edit Promo Code" : "Add Promo Code"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="code" className="text-gray-400">Promo Code *</Label>
              <Input id="code" placeholder="e.g. WINTER20" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 uppercase" />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="discountType" className="text-gray-400">Discount Type *</Label>
              <select
                id="discountType"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="percentage" className="bg-[#0B1121] text-white">Percentage (%)</option>
                <option value="fixed_amount" className="bg-[#0B1121] text-white">Fixed Amount (৳)</option>
              </select>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="discountValue" className="text-gray-400">Discount Value *</Label>
              <Input id="discountValue" type="number" step="0.01" placeholder={formData.discountType === 'percentage' ? "20" : "500"} value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="maxUses" className="text-gray-400">Max Uses (Global)</Label>
              <Input id="maxUses" type="number" placeholder="e.g. 100" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="maxUsesPerUser" className="text-gray-400">Max Uses (Per User)</Label>
              <Input id="maxUsesPerUser" type="number" placeholder="e.g. 1" value={formData.maxUsesPerUser} onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="validUntil" className="text-gray-400">Valid Until (Optional)</Label>
              <Input id="validUntil" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <span className="text-red-500 text-sm mt-2">* Please fill all the required fields</span>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : "Save Promo Code"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
