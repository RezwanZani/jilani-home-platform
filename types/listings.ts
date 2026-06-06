export type SpaceType = 'All' | 'Office Space' | 'Convention Hall';
export type SortOption = 'Newest' | 'Capacity: High to Low' | 'Capacity: Low to High' | 'Top Rated' | 'Price: Low to High' | 'Price: High to Low';

export type Listing = {
    id: string;
    slug: string;
    title: string;
    image: string;
    type: string;
    isSaved?: boolean;
    area: string;
    city: string;
    description: string;
    roomCount?: number;
    sizeSqft?: number;
    capacity?: number;
    priceType?: string;
    rating: number;
    reviews: number;
    price: string;
    amenities: string[];
    verified: boolean;
    tag: string | null;
};