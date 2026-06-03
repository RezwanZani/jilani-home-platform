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
import { createPackage, updatePackage } from "@/lib/actions/package-actions";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export default function PackageFormModal({ isOpen, onClose, initialData }: PackageFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    points: "",
    price: "",
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        name_bn: initialData?.name_bn || "",
        points: initialData?.points || "",
        price: initialData?.price || "",
        isActive: initialData ? initialData.isActive : true,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.points || !formData.price) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (initialData) {
      // EDIT MODE
      result = await updatePackage(initialData.id, formData);
    } else {
      // CREATE MODE
      result = await createPackage(formData);
    }

    if (result.success) {
      setFormData({
        name: "",
        name_bn: "",
        points: "",
        price: "",
        isActive: true,
      });
      setIsSubmitting(false);
      onClose();
      toast.success(initialData ? "Package updated successfully" : "Package added successfully");
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Failed to save package");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initialData ? "Edit Package" : "Add New Package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-gray-400">Package Name *</Label>
              <Input id="name" placeholder="e.g. 1000 Points" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-gray-400">Package Name (Bengali)</Label>
              <Input id="name_bn" placeholder="১০০০ পয়েন্ট" value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="points" className="text-gray-400">Points *</Label>
              <Input id="points" type="number" placeholder="1000" value={formData.points} onChange={(e) => setFormData({ ...formData, points: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="price" className="text-gray-400">Price (BDT) *</Label>
              <Input id="price" type="number" step="0.01" placeholder="500.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>

          <span className="text-red-500 text-sm mt-2">* Please fill all the required fields</span>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : "Save Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
