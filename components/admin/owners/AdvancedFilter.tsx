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

interface AdvancedFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function AdvancedFilter({ isOpen, onClose, onApply, currentFilters }: AdvancedFilterModalProps) {
    const [filterCriteria, setFilterCriteria] = useState({
        name: "",
        phone: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFilterCriteria({
                name: currentFilters?.name || "",
                phone: currentFilters?.phone || "",
            });
        }
    }, [isOpen, currentFilters]);

    const handleApply = () => {
        onApply(filterCriteria);
        onClose();
    };

    const handleClear = () => {
        const cleared = { name: "", phone: "" };
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
                        <Label htmlFor="name" className="text-gray-400">Owner Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. John Doe"
                            value={filterCriteria.name}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, name: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="phone" className="text-gray-400">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="017XXXXXXXX"
                            value={filterCriteria.phone}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, phone: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
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