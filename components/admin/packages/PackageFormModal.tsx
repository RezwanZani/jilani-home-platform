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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export default function PackageFormModal({ isOpen, onClose, initialData }: PackageFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    name_bn: string;
    points: string;
    price: string;
    isActive: boolean;
    isPopular: boolean;
    features: { text: string; text_bn: string }[];
  }>({
    name: "",
    name_bn: "",
    points: "",
    price: "",
    isActive: true,
    isPopular: false,
    features: [],
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        name_bn: initialData?.name_bn || "",
        points: initialData?.points || "",
        price: initialData?.price || "",
        isActive: initialData ? initialData.isActive : true,
        isPopular: initialData ? initialData.isPopular : false,
        features: initialData?.features || [],
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
        isPopular: false,
        features: [],
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
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? "Edit Package" : "Add New Package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Package Name *</Label>
              <Input id="name" placeholder="e.g. 1000 Points" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name_bn" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Package Name (Bengali)</Label>
              <Input id="name_bn" placeholder="১০০০ পয়েন্ট" value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="points" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Points *</Label>
              <Input id="points" type="number" placeholder="1000" value={formData.points} onChange={(e) => setFormData({ ...formData, points: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="price" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Price (BDT) *</Label>
              <Input id="price" type="number" step="0.01" placeholder="500.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-11 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1 flex flex-col justify-center">
              <Label htmlFor="isPopular" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Mark as Popular?</Label>
              <div className="flex items-center gap-3">
                <Switch 
                  id="isPopular" 
                  checked={formData.isPopular} 
                  onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })} 
                />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{formData.isPopular ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4 py-3 border-t border-gray-100 dark:border-white/5 mt-2 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Package Features</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setFormData({ ...formData, features: [...formData.features, { text: "", text_bn: "" }] })}
                className="rounded-xl font-bold bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors h-9 px-3"
              >
                <Plus className="w-4 h-4 mr-1 text-blue-500" /> Add Feature
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {formData.features.map((feature, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input 
                      placeholder="Feature (English)" 
                      value={feature.text} 
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index].text = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }} 
                      className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm text-sm" 
                    />
                  </div>
                  <div className="col-span-6">
                    <Input 
                      placeholder="Feature (Bengali)" 
                      value={feature.text_bn} 
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index].text_bn = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }} 
                      className="h-10 rounded-xl bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm text-sm" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => {
                        const newFeatures = [...formData.features];
                        newFeatures.splice(index, 1);
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-slate-950/20">No features added yet.</p>
              )}
            </div>
          </div>

          <div className="text-xs text-red-500 font-medium mt-1 mb-4">* Please fill all the required fields</div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              {isSubmitting ? "Saving..." : "Save Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
