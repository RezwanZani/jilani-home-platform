"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateUser, createUser } from "@/lib/actions/user-actions"; // Imported createUser

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
    onSuccess?: () => void;
}

export default function UserFormModal({ isOpen, onClose, initialData, onSuccess }: UserFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "", // Only used for creation
        role: "user",
        pointsBalance: 0,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    email: initialData.email || "",
                    phoneNumber: initialData.phoneNumber || "",
                    password: "", // Leave blank on edit
                    role: initialData.role || "user",
                    pointsBalance: initialData.pointsBalance || 0,
                });
            } else {
                // Reset for Create
                setFormData({
                    name: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    role: "user",
                    pointsBalance: 0,
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || (!initialData && !formData.password)) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        let result;

        if (initialData) {
            result = await updateUser(initialData.id, formData);
        } else {
            result = await createUser(formData);
        }

        if (result.success) {
            setIsSubmitting(false);
            onClose();
            if (onSuccess) onSuccess();
            toast.success(initialData ? "User updated successfully" : "User created successfully");
        } else {
            setIsSubmitting(false);
            toast.error(result.error || "Failed to save user");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {initialData ? "Edit User Details" : "Add New User"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">

                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input placeholder="01XXXXXXXXX" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                        </div>

                        {/* Password is only shown when creating a new user */}
                        {!initialData && (
                            <div className="space-y-2">
                                <Label>Password *</Label>
                                <Input type="password" placeholder="Min. 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>System Role</Label>
                                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create User")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
