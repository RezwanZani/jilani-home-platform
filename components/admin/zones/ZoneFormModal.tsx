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
      <DialogContent className="sm:max-w-[600px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initialData ? "Edit Zone" : "Add New Zone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-gray-400">Zone Name *</Label>
              <Input id="name" placeholder="Mirpur 10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-gray-400">Zone Name (Bengali) *</Label>
              <Input id="name_bn" placeholder="মিরপুর ১০" value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city" className="text-gray-400">City / District *</Label>
              <Input id="city" placeholder="Dhaka" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city_bn" className="text-gray-400">City (Bengali) *</Label>
              <Input id="city_bn" placeholder="ঢাকা" value={formData.city_bn} onChange={(e) => setFormData({ ...formData, city_bn: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="thana" className="text-gray-400">Thana / Upazila</Label>
              <Input id="thana" placeholder="Mirpur" value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="thana_bn" className="text-gray-400">Thana (Bengali)</Label>
              <Input id="thana_bn" placeholder="মিরপুর" value={formData.thana_bn} onChange={(e) => setFormData({ ...formData, thana_bn: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="area" className="text-gray-400">Area</Label>
              <Input id="area" placeholder="Block C" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="area_bn" className="text-gray-400">Area (Bengali)</Label>
              <Input id="area_bn" placeholder="ব্লক সি" value={formData.area_bn} onChange={(e) => setFormData({ ...formData, area_bn: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>

          <span className="text-red-500 text-sm mt-2">* Please fill all the required fields</span>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : "Save Zone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
