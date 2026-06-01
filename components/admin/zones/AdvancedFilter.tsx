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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createZone, updateZone } from "@/lib/actions/zone-actions";

interface ZoneFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
}

interface AdvancedFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function ZoneFormModal({ isOpen, onClose, onApply, currentFilters }: AdvancedFilterModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterCriteria, setFilterCriteria] = useState({
        city: "",
        thana: "",
        area: "",
        isActive: undefined as boolean | undefined,
    });

    useEffect(() => {
        if (isOpen) {
            setFilterCriteria({
                city: currentFilters?.city || "",
                thana: currentFilters?.thana || "",
                area: currentFilters?.area || "",
                isActive: currentFilters ? currentFilters.isActive : undefined,
            });
        }
    }, [isOpen, currentFilters]);

    const handleApply = () => {
        onApply(filterCriteria);
        onClose();
    };

    const handleClear = () => {
        const cleared = { city: "", thana: "", area: "", isActive: undefined };
        setFilterCriteria(cleared);
        onApply(cleared); // Instantly apply clear action
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Advanced Filter</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="city" className="text-gray-400">City / District *</Label>
                        <Input id="city" placeholder="Dhaka" value={filterCriteria.city} onChange={(e) => setFilterCriteria({ ...filterCriteria, city: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="thana" className="text-gray-400">Thana / Upazila</Label>
                        <Input id="thana" placeholder="Mirpur" value={filterCriteria.thana} onChange={(e) => setFilterCriteria({ ...filterCriteria, thana: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="area" className="text-gray-400">Area</Label>
                        <Input id="area" placeholder="Block C" value={filterCriteria.area} onChange={(e) => setFilterCriteria({ ...filterCriteria, area: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="isActive" className="text-gray-400">Status</Label>
                        <Select
                            value={filterCriteria.isActive === undefined ? "all" : filterCriteria.isActive ? "active" : "inactive"}
                            onValueChange={(value) => setFilterCriteria({ ...filterCriteria, isActive: value === "all" ? undefined : value === "active" })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={handleClear} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                        Clear
                    </Button>
                    <Button type="button" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
