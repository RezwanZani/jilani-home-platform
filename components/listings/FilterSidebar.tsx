'use client';

import { MapPin, HousePlus, Check, DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export const SPACE_TYPES = ['All', 'House', 'Office', 'Hall', 'Apartment', 'Commercial', 'Studio', 'Villa', 'Penthouse'];

export const ROOM_COUNTS = [
    { label: 'Any Rooms', val: 0 },
    { label: '1+ Rooms', val: 1 },
    { label: '2+ Rooms', val: 2 },
    { label: '3+ Rooms', val: 3 },
    { label: '4+ Rooms', val: 4 },
    { label: '5+ Rooms', val: 5 },
];

export const ALL_AMENITIES = [
    { label: 'WiFi', val: 'WiFi' },
    { label: 'Parking', val: 'Parking' },
    { label: 'AC', val: 'AC' },
    { label: 'Stage', val: 'Stage' },
    { label: 'Projector', val: 'Projector' },
    { label: 'Catering', val: 'Catering' },
    { label: 'Gym', val: 'Gym' },
    { label: 'Security', val: 'Security' },
    { label: 'CCTV', val: 'CCTV' },
    { label: 'Elevator', val: 'Elevator' },
    { label: 'Furnished', val: 'Furnished' },
    { label: 'Kitchen', val: 'Kitchen' },
];

type FilterSidebarProps = {
    typeFilter: string;
    setTypeFilter: (t: string) => void;
    availableCities: string[];
    cityFilter: string;
    setCityFilter: (c: string) => void;
    roomCount: number;
    setRoomCount: (i: number) => void;
    amenityFilters: string[];
    toggleAmenity: (a: string) => void;
    minPrice: string;
    setMinPrice: (p: string) => void;
    maxPrice: string;
    setMaxPrice: (p: string) => void;
    priceType: string;
    setPriceType: (p: string) => void;
    activeFilterCount: number;
    clearFilters: () => void;
};

export default function FilterSidebar({
    typeFilter, setTypeFilter,
    availableCities, cityFilter, setCityFilter,
    roomCount, setRoomCount,
    amenityFilters, toggleAmenity,
    minPrice, setMinPrice, maxPrice, setMaxPrice, priceType, setPriceType,
    activeFilterCount, clearFilters
}: FilterSidebarProps) {
    return (
        <div className="space-y-7 pb-10">
            {/* ── Space Type ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Space Type</p>
                <div className="space-y-1">
                    {SPACE_TYPES.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${typeFilter === t ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── City ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">City</p>
                <div className="space-y-1">
                    {availableCities.map(c => (
                        <button key={c} onClick={() => setCityFilter(c)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${cityFilter === c ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                            <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-60" />{c}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Rooms ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Rooms</p>
                <div className="space-y-1">
                    {ROOM_COUNTS.map(r => (
                        <button key={r.label} onClick={() => setRoomCount(r.val)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${roomCount === r.val ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                            <HousePlus className="w-3.5 h-3.5 opacity-60" />{r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Price Range ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Price Range (৳)</p>
                <div className="px-2 mb-4 mt-2">
                    <Slider
                        min={0}
                        max={100000}
                        step={1000}
                        value={[
                            minPrice ? Number(minPrice) : 0,
                            maxPrice ? Number(maxPrice) : 100000
                        ]}
                        onValueChange={([min, max]) => {
                            setMinPrice(min === 0 ? '' : min.toString());
                            setMaxPrice(max === 100000 ? '' : max.toString());
                        }}
                    />
                    <div className="flex justify-between items-center mt-3 text-xs font-medium text-gray-400">
                        <span>৳{minPrice ? Number(minPrice).toLocaleString() : '0'}</span>
                        <span>{maxPrice ? `৳${Number(maxPrice).toLocaleString()}` : '৳1,00,000+'}</span>
                    </div>
                </div>
                <select value={priceType} onChange={e => setPriceType(e.target.value)} className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#3B82F6]/50 transition-colors appearance-none">
                    <option value="All">Any Payment Type</option>
                    <option value="month">Per Month</option>
                    <option value="day">Per Day</option>
                    <option value="year">Per Year</option>
                    <option value="one-time">One-time / Fixed</option>
                </select>
            </div>

            {/* ── Amenities ── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Amenities</p>
                <div className="grid grid-cols-2 gap-2">
                    {ALL_AMENITIES.map(a => (
                        <button key={a.val} onClick={() => toggleAmenity(a.val)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all border ${amenityFilters.includes(a.val) ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]' : 'border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20'}`}>
                            <Check className={`w-3 h-3 ${amenityFilters.includes(a.val) ? 'opacity-100' : 'opacity-0'}`} /> {a.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="w-full text-sm text-gray-500 hover:text-white py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                    Clear all filters
                </button>
            )}
        </div>
    );
}
