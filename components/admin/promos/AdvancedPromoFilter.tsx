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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedPromoFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function AdvancedPromoFilter({ isOpen, onClose, onApply, currentFilters }: AdvancedPromoFilterProps) {
    const [filterCriteria, setFilterCriteria] = useState({
        isActive: undefined as boolean | undefined,
        discountType: "all",
        minAmount: "",
        maxAmount: "",
        validUntil: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFilterCriteria({
                isActive: currentFilters?.isActive,
                discountType: currentFilters?.discountType || "all",
                minAmount: currentFilters?.minAmount || "",
                maxAmount: currentFilters?.maxAmount || "",
                validUntil: currentFilters?.validUntil || "",
            });
        }
    }, [isOpen, currentFilters]);

    const handleApply = () => {
        onApply(filterCriteria);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            isActive: undefined,
            discountType: "all",
            minAmount: "",
            maxAmount: "",
            validUntil: "",
        };
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
                    
                    {/* Status */}
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

                    {/* Discount Type */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="discountType" className="text-gray-400">Discount Type</Label>
                        <Select
                            value={filterCriteria.discountType}
                            onValueChange={(value) => setFilterCriteria({ ...filterCriteria, discountType: value })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="minAmount" className="text-gray-400">Min Discount Amount</Label>
                        <Input id="minAmount" type="number" placeholder="0" value={filterCriteria.minAmount} onChange={(e) => setFilterCriteria({ ...filterCriteria, minAmount: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="maxAmount" className="text-gray-400">Max Discount Amount</Label>
                        <Input id="maxAmount" type="number" placeholder="1000" value={filterCriteria.maxAmount} onChange={(e) => setFilterCriteria({ ...filterCriteria, maxAmount: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    {/* Validity Range */}
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="validUntil" className="text-gray-400">Valid Until</Label>
                        <Input id="validUntil" type="date" value={filterCriteria.validUntil} onChange={(e) => setFilterCriteria({ ...filterCriteria, validUntil: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" style={{ colorScheme: 'dark' }} />
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={handleClear} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                        Clear
                    </Button>
                    <Button type="button" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Apply Filter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
