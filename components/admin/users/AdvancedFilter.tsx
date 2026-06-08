"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function AdvancedFilter({ isOpen, onClose, onApply, currentFilters }: AdvancedFilterProps) {
    const [role, setRole] = useState("all");

    useEffect(() => {
        if (isOpen) {
            setRole(currentFilters?.role || "all");
        }
    }, [isOpen, currentFilters]);

    const handleApply = () => {
        onApply({ role });
        onClose();
    };

    const handleClear = () => {
        setRole("all");
        onApply({ role: "all" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Filter Users</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2">
                        <Label>System Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
                    <Button type="button" onClick={handleApply} className="bg-blue-600 text-white hover:bg-blue-700">Apply</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
