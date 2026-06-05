'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ChevronDown, Building2, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/listings/ListingCard';
import FilterSidebar from '@/components/listings/FilterSidebar';

import { getPaginatedProperties, getAvailableCities } from '@/lib/actions/property-actions';
import { SortOption, Listing } from '@/types/listings';

export default function ListingsPage() {
  const [dbListings, setDbListings] = useState<Listing[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>(['All Cities']);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Expanded Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [roomCount, setRoomCount] = useState(0);
  const [amenityFilters, setAmenityFilters] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceType, setPriceType] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('Newest');

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    getAvailableCities().then((res) => {
      if (res.success && res.data.length > 0) {
        setAvailableCities(['All Cities', ...res.data]);
      }
    });
  }, []);

  const fetchListings = async (isReset = false) => {
    const currentPage = isReset ? 1 : page + 1;
    if (isReset) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const { data } = await getPaginatedProperties({
        page: currentPage,
        limit: 24,
        search: search.trim(),
        type: typeFilter,
        city: cityFilter,
        minRooms: roomCount,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        priceType: priceType,
        amenities: amenityFilters, // Now sends exact lowercase strings to DB
        sortBy: sortBy,
      });

      const formatted: Listing[] = data.map((item: any) => ({
        id: item.property.id,
        slug: item.property.slug,
        title: item.property.title,
        image: item.property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
        type: item.property.type || 'Unknown',
        area: item.zone?.name || 'Unknown Area',
        city: item.zone?.city || 'Unknown City',
        description: item.property.description || 'No description provided.',
        priceType: item.property.priceType || 'one-time',
        roomCount: item.property.roomCount || 0,
        rating: Number(item.property.averageRating) || 0,
        reviews: Number(item.property.totalReviews) || 0,
        price: `৳ ${item.property.price}`,
        amenities: Array.isArray(item.property.amenities) ? item.property.amenities : [],
        verified: item.property.status === 'active',
        tag: Number(item.property.averageRating) >= 4.5 ? 'Top Rated' : null,
      }));

      if (isReset) {
        setDbListings(formatted);
        setPage(1);
      } else {
        setDbListings(prev => [...prev, ...formatted]);
        setPage(currentPage);
      }
      setHasMore(formatted.length === 24);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, typeFilter, cityFilter, roomCount, minPrice, maxPrice, priceType, amenityFilters, sortBy]);

  const toggleAmenity = (a: string) => setAmenityFilters(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const clearFilters = () => {
    setTypeFilter('All'); setCityFilter('All Cities'); setRoomCount(0);
    setAmenityFilters([]); setSearch(''); setMinPrice(''); setMaxPrice(''); setPriceType('All');
  };

  const activeFilterCount = [
    typeFilter !== 'All', cityFilter !== 'All Cities', roomCount !== 0,
    amenityFilters.length > 0, minPrice !== '', maxPrice !== '', priceType !== 'All'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-['Inter'] overflow-x-hidden">
      <Navbar />
      <div className="pt-28 pb-8 border-b border-white/[0.06] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold text-white mb-1">Browse Spaces</h1>
          <div className="flex gap-3 mt-5">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search by name, city or area…" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3B82F6]/50 transition-colors" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
            </div>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 bg-[#141414] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="bg-[#3B82F6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-['Space_Grotesk'] font-semibold text-white flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" /> Filters</span>
              </div>
              <FilterSidebar
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                availableCities={availableCities} cityFilter={cityFilter} setCityFilter={setCityFilter}
                roomCount={roomCount} setRoomCount={setRoomCount}
                amenityFilters={amenityFilters} toggleAmenity={toggleAmenity}
                minPrice={minPrice} setMinPrice={setMinPrice}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                priceType={priceType} setPriceType={setPriceType}
                activeFilterCount={activeFilterCount} clearFilters={clearFilters}
              />
            </div>
          </aside>

          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} className="fixed left-0 top-0 bottom-0 w-80 bg-[#111111] border-r border-white/[0.07] z-50 overflow-y-auto p-6 lg:hidden">
                  <div className="flex items-center justify-between mb-6"><span className="font-['Space_Grotesk'] font-semibold text-white">Filters</span><button onClick={() => setSidebarOpen(false)} className="text-gray-500"><X className="w-5 h-5" /></button></div>
                  <FilterSidebar
                    typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                    availableCities={availableCities} cityFilter={cityFilter} setCityFilter={setCityFilter}
                    roomCount={roomCount} setRoomCount={setRoomCount}
                    amenityFilters={amenityFilters} toggleAmenity={toggleAmenity}
                    minPrice={minPrice} setMinPrice={setMinPrice}
                    maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                    priceType={priceType} setPriceType={setPriceType}
                    activeFilterCount={activeFilterCount} clearFilters={clearFilters}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm"><span className="text-white font-medium">{dbListings.length}</span> spaces shown</span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setSortOpen(o => !o)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-[#141414] border border-white/[0.08] rounded-xl px-4 py-2 transition-all">
                    <ArrowUpDown className="w-3.5 h-3.5" />{sortBy}<ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20">
                        {(['Newest', 'Top Rated'] as SortOption[]).map(s => (
                          <button key={s} onClick={() => { setSortBy(s); setSortOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === s ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{s}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center bg-[#141414] border border-white/[0.08] rounded-xl p-1">
                  <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-[#3B82F6] text-white' : 'text-gray-500 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setView('list')} className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-[#3B82F6] text-white' : 'text-gray-500 hover:text-white'}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-[#3B82F6] animate-pulse text-xl">Loading Spaces...</div>
            ) : dbListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Building2 className="w-12 h-12 text-gray-700 mb-4" />
                <h3 className="font-semibold mb-2">No spaces found</h3>
                <button onClick={clearFilters} className="text-sm text-[#3B82F6] px-5 py-2">Clear all filters</button>
              </div>
            ) : (
              <div className="flex flex-col">
                <motion.div layout className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4'}>
                  <AnimatePresence mode="sync">
                    {dbListings.map(l => <ListingCard key={l.id} listing={l} view={view} />)}
                  </AnimatePresence>
                </motion.div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => fetchListings(false)} disabled={isLoadingMore} className="bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white disabled:opacity-50 border border-[#3B82F6]/30 px-8 py-3 rounded-full font-semibold">
                      {isLoadingMore ? "Loading..." : "See More Properties"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}