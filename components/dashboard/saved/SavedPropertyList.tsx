'use client';

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PropertyCard } from "./PropertyCard"; // Ensure PropertyCard is in the same directory

import { deleteSavedProperty } from "@/lib/actions/save-actions";
import { toast } from "sonner";

// Define and export the shape of your property data
export interface SavedProperty {
  data: {
    id: string;
    ownerId: string;
    zoneId: number;
    title: string;
    title_bn: string | null;
    description: string | null;
    description_bn: string | null;
    coverImage: string | null;
    slug: string;
    priceType: "hour" | "month" | "day" | "year" | "event" | "one-time";
    type: "house" | "office" | "hall" | "apartment" | "studio" | "penthouse" | "villa" | "commercial";
    price: string;
    sizeSqft: number | null;
    roomCount: number;
    amenities: unknown;
    amenities_bn: unknown;
    averageRating: string;
    totalReviews: number;
    status: "pending" | "active" | "inactive" | "expired";
    viewsCount: number;
    lastActivityDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    images: string[];
  }
  zone: {
    id: number;
    name: string;
    city: string | null;
    thana: string | null;
    area: string | null;
  } | null;
  savedAt: Date | null;
  unlockedId: string | null;

};

// Type the props for the List component
interface SavedPropertyListProps {
  initialItems: SavedProperty[];
}

export function SavedPropertyList({ initialItems }: SavedPropertyListProps) {
  // Tell useState what type of array it holds
  const [items, setItems] = useState<SavedProperty[]>(initialItems);

  // Explicitly type the id, prev array, and individual property 'p'
  const remove = async (id: string) => {
    setItems((prev: SavedProperty[]) => prev.filter((p: SavedProperty) => p.data.id !== id));
    try {
      const res = await deleteSavedProperty(id);
      if (res?.success) {
        toast.success("Property removed from saved");
      } else {
        toast.error("Failed to remove property from saved");
      }
    } catch (error) {
      console.error("Error removing property from saved:", error);
      toast.error("Failed to remove property from saved");
    }
  }
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Saved Listings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          Manage and view your {items.length} favorite properties.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {/* TypeScript will now infer 'property' and 'i' automatically */}
          {items.map((item, i) => (
            <PropertyCard
              key={item.data.id}
              property={item}
              index={i}
              remove={remove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
