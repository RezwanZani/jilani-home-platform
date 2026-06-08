"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdvancedFilter({ isOpen, onClose, onApply, currentFilters }: any) {
    const [filter, setFilter] = useState({ type: "all", status: "all" });

    useEffect(() => {
        if (isOpen) setFilter({ type: currentFilters?.type || "all", status: currentFilters?.status || "all" });
    }, [isOpen, currentFilters]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><DialogTitle className="text-xl font-bold">Filter Properties</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select value={filter.type} onValueChange={(val) => setFilter({ ...filter, type: val })}>
                            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="hall">Convention Hall</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={filter.status} onValueChange={(val) => setFilter({ ...filter, status: val })}>
                            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onApply({ type: "all", status: "all" })}>Clear</Button>
                    <Button onClick={() => { onApply(filter); onClose(); }} className="bg-blue-600 text-white">Apply</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
