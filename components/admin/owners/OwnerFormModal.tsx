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
import { createOwner, updateOwner } from "@/lib/actions/owner-actions";

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSuccess?: () => void;
}

export default function OwnerFormModal({ isOpen, onClose, initialData, onSuccess }: OwnerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    phone: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        name_bn: initialData?.name_bn || "",
        phone: initialData?.phone || "",
        whatsapp: initialData?.whatsapp || "",
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Please fill all the required fields");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (initialData) {
      // EDIT MODE
      result = await updateOwner(initialData.id, formData);
    } else {
      // CREATE MODE
      result = await createOwner(formData);
    }

    if (result.success) {
      setFormData({
        name: "",
        name_bn: "",
        phone: "",
        whatsapp: "",
      });
      setIsSubmitting(false);
      onClose();

      // Trigger the success callback to refresh the parent table
      if (onSuccess) onSuccess();

      toast.success(initialData ? "Owner updated successfully" : "Owner added successfully");
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Failed to save owner");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? "Edit Owner" : "Add New Owner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Owner Name *</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Owner Name (Bengali)</Label>
              <Input
                id="name_bn"
                placeholder="e.g. জন ডন"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="phone" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="whatsapp" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="017XXXXXXXX"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
              />
            </div>

          </div>

          <div className="text-xs text-red-500 font-medium mt-1 mb-4">* Please fill all the required fields</div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              {isSubmitting ? "Saving..." : "Save Owner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
