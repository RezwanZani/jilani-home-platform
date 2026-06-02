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
      <DialogContent className="sm:max-w-[600px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initialData ? "Edit Owner" : "Add New Owner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-gray-400">Owner Name *</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-gray-400">Owner Name (Bengali)</Label>
              <Input
                id="name_bn"
                placeholder="e.g. জন ডন"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="phone" className="text-gray-400">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="whatsapp" className="text-gray-400">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="017XXXXXXXX"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

          </div>

          <span className="text-red-500 text-sm mt-2">* Please fill all the required fields</span>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : "Save Owner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}