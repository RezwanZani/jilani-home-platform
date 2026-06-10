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
import { createZone, updateZone } from "@/lib/actions/zone-actions";

interface ZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export default function ZoneFormModal({ isOpen, onClose, initialData }: ZoneFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    city: "",
    city_bn: "",
    thana: "",
    thana_bn: "",
    area: "",
    area_bn: "",
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        name_bn: initialData?.name_bn || "",
        city: initialData?.city || "",
        city_bn: initialData?.city_bn || "",
        thana: initialData?.thana || "",
        thana_bn: initialData?.thana_bn || "",
        area: initialData?.area || "",
        area_bn: initialData?.area_bn || "",
        isActive: initialData ? initialData.isActive : true,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.name_bn || !formData.city || !formData.city_bn || !formData.thana || !formData.thana_bn || !formData.area || !formData.area_bn) {
      toast.error("Please fill all the fields");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (initialData) {
      // EDIT MODE
      result = await updateZone(initialData.id, formData);
    } else {
      // CREATE MODE
      result = await createZone(formData);
    }

    if (result.success) {
      setFormData({
        name: "",
        name_bn: "",
        city: "",
        city_bn: "",
        thana: "",
        thana_bn: "",
        area: "",
        area_bn: "",
        isActive: false,
      });
      setIsSubmitting(false);
      onClose();
      toast.success(initialData ? "Zone updated successfully" : "Zone added successfully");
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Failed to add zone");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? "Edit Zone" : "Add New Zone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Zone Name *</Label>
              <Input id="name" placeholder="Mirpur 10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Zone Name (Bengali) *</Label>
              <Input id="name_bn" placeholder="মিরপুর ১০" value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">City / District *</Label>
              <Input id="city" placeholder="Dhaka" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">City (Bengali) *</Label>
              <Input id="city_bn" placeholder="ঢাকা" value={formData.city_bn} onChange={(e) => setFormData({ ...formData, city_bn: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="thana" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Thana / Upazila</Label>
              <Input id="thana" placeholder="Mirpur" value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="thana_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Thana (Bengali)</Label>
              <Input id="thana_bn" placeholder="মিরপুর" value={formData.thana_bn} onChange={(e) => setFormData({ ...formData, thana_bn: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="area" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Area</Label>
              <Input id="area" placeholder="Block C" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="area_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Area (Bengali)</Label>
              <Input id="area_bn" placeholder="ব্লক সি" value={formData.area_bn} onChange={(e) => setFormData({ ...formData, area_bn: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
          </div>
 
          <div className="text-xs text-red-500 font-medium mt-1 mb-4">* Please fill all the required fields</div>
 
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              {isSubmitting ? "Saving..." : "Save Zone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
