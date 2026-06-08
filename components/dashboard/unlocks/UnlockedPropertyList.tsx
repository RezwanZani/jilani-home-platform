'use client';

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { UnlockedPropertyCard } from "./UnlockedPropertyCard";
import { getUnlockedProperties } from "@/lib/actions/unlock-actions";

export interface UnlockedProperty {
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
  unlockedAt: Date | null;
  expiresAt: Date | null;
  unlockedId: string | null;
};

interface UnlockedPropertyListProps {
  initialItems: UnlockedProperty[];
  initialHasMore: boolean;
}

export function UnlockedPropertyList({ initialItems, initialHasMore }: UnlockedPropertyListProps) {
  const [items, setItems] = useState<UnlockedProperty[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const res = await getUnlockedProperties(nextPage, 10);
      if (res.success && res.data) {
        setItems(prev => [...prev, ...res.data]);
        setPage(nextPage);
        setHasMore(res.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to load more unlocked properties", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Unlocked Properties
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          View the owner contact details for {items.length} unlocked properties.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <UnlockedPropertyCard
              key={item.data.id}
              property={item}
              index={i}
            />
          ))}
        </AnimatePresence>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="bg-gray-900 dark:bg-[#1E293B] text-white hover:bg-blue-600 disabled:opacity-50 border border-transparent dark:border-white/10 px-8 py-3 rounded-full font-semibold transition-all shadow-lg"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
