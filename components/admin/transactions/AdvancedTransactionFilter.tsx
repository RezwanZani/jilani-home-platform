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

interface AdvancedTransactionFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function AdvancedTransactionFilter({ isOpen, onClose, onApply, currentFilters }: AdvancedTransactionFilterProps) {
    const [filterCriteria, setFilterCriteria] = useState({
        userName: "",
        gateway: "all",
        status: "all",
        packageName: "",
        promoCode: "",
        minAmount: "",
        maxAmount: "",
        dateFrom: "",
        dateUntil: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFilterCriteria({
                userName: currentFilters?.userName || "",
                gateway: currentFilters?.gateway || "all",
                status: currentFilters?.status || "all",
                packageName: currentFilters?.packageName || "",
                promoCode: currentFilters?.promoCode || "",
                minAmount: currentFilters?.minAmount || "",
                maxAmount: currentFilters?.maxAmount || "",
                dateFrom: currentFilters?.dateFrom || "",
                dateUntil: currentFilters?.dateUntil || "",
            });
        }
    }, [isOpen, currentFilters]);

    const handleApply = () => {
        onApply(filterCriteria);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            userName: "",
            gateway: "all",
            status: "all",
            packageName: "",
            promoCode: "",
            minAmount: "",
            maxAmount: "",
            dateFrom: "",
            dateUntil: "",
        };
        setFilterCriteria(cleared);
        onApply(cleared); // Instantly apply clear action
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] bg-[#0B1121] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Advanced Filter</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    
                    {/* User Name */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="userName" className="text-gray-400">User Name</Label>
                        <Input id="userName" placeholder="e.g. John Doe" value={filterCriteria.userName} onChange={(e) => setFilterCriteria({ ...filterCriteria, userName: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    {/* Status */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="status" className="text-gray-400">Transaction Status</Label>
                        <Select
                            value={filterCriteria.status}
                            onValueChange={(value) => setFilterCriteria({ ...filterCriteria, status: value })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Gateway */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="gateway" className="text-gray-400">Payment Gateway</Label>
                        <Select
                            value={filterCriteria.gateway}
                            onValueChange={(value) => setFilterCriteria({ ...filterCriteria, gateway: value })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600">
                                <SelectValue placeholder="Select Gateway" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="bKash">bKash</SelectItem>
                                <SelectItem value="Nagad">Nagad</SelectItem>
                                <SelectItem value="Rocket">Rocket</SelectItem>
                                <SelectItem value="Stripe">Stripe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Package Name */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="packageName" className="text-gray-400">Package Name</Label>
                        <Input id="packageName" placeholder="e.g. Premium" value={filterCriteria.packageName} onChange={(e) => setFilterCriteria({ ...filterCriteria, packageName: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    {/* Promo Code */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="promoCode" className="text-gray-400">Promo Code</Label>
                        <Input id="promoCode" placeholder="e.g. WINTER20" value={filterCriteria.promoCode} onChange={(e) => setFilterCriteria({ ...filterCriteria, promoCode: e.target.value.toUpperCase() })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 uppercase" />
                    </div>

                    <div className="hidden sm:block col-span-1"></div>

                    {/* Amount Range */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="minAmount" className="text-gray-400">Min Amount (৳)</Label>
                        <Input id="minAmount" type="number" placeholder="0" value={filterCriteria.minAmount} onChange={(e) => setFilterCriteria({ ...filterCriteria, minAmount: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="maxAmount" className="text-gray-400">Max Amount (৳)</Label>
                        <Input id="maxAmount" type="number" placeholder="5000" value={filterCriteria.maxAmount} onChange={(e) => setFilterCriteria({ ...filterCriteria, maxAmount: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="dateFrom" className="text-gray-400">Date From</Label>
                        <Input id="dateFrom" type="date" value={filterCriteria.dateFrom} onChange={(e) => setFilterCriteria({ ...filterCriteria, dateFrom: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="dateUntil" className="text-gray-400">Date Until</Label>
                        <Input id="dateUntil" type="date" value={filterCriteria.dateUntil} onChange={(e) => setFilterCriteria({ ...filterCriteria, dateUntil: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" style={{ colorScheme: 'dark' }} />
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
