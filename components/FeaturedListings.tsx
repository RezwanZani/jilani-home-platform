'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

import {
  Shield, MapPin, Phone, Wind, Car, Users, Mail, Lock,
  Star, CheckCircle2, Sparkles, Wifi, Mic2, Projector, UtensilsCrossed,
  Home, Building2, Landmark, Building, Briefcase, Castle, Store, Crown,
  Dumbbell, ShieldCheck, ArrowUpDown, Sofa, Zap,
  Flame, Waves, Coffee, Cctv, Check, HousePlus,
  Refrigerator,
  Microwave,
  Tv,
  Flower
} from 'lucide-react';

import Link from 'next/link';
import { getTopRatedProperties } from '@/lib/actions/property-actions';
import SaveButton from './listings/SaveButton';
import CardUnlockButton from './listings/CardUnlockButton';

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const A_ICONS: Record<string, React.ReactNode> = {
  'wiFi': <Wifi className="w-3.5 h-3.5" />,
  'parking': <Car className="w-3.5 h-3.5" />,
  'ac': <Wind className="w-3.5 h-3.5" />,
  'stage': <Mic2 className="w-3.5 h-3.5" />,
  'projector': <Projector className="w-3.5 h-3.5" />,
  'catering': <UtensilsCrossed className="w-3.5 h-3.5" />,
  'gym': <Dumbbell className="w-3.5 h-3.5" />,
  'security': <ShieldCheck className="w-3.5 h-3.5" />,
  'cctv': <Cctv className="w-3.5 h-3.5" />,
  'elevator': <ArrowUpDown className="w-3.5 h-3.5" />,
  'furnished': <Sofa className="w-3.5 h-3.5" />,
  'power backup': <Zap className="w-3.5 h-3.5" />,
  'heating': <Flame className="w-3.5 h-3.5" />,
  'swimming pool': <Waves className="w-3.5 h-3.5" />,
  'kitchen': <Coffee className="w-3.5 h-3.5" />,
  'tv': <Tv className="w-3.5 h-3.5" />,
  'refrigerator': <Refrigerator className="w-3.5 h-3.5" />,
  'microwave': <Microwave className="w-3.5 h-3.5" />,
  'balcony': <Flower className="w-3.5 h-3.5" />,
  'freeze': <Refrigerator className="w-3.5 h-3.5" />,
  'other': <Check className="w-3.5 h-3.5" />, // Explicit "Other" mapping
};

type CardState = 'active' | 'visible' | 'hidden';

const propertyTypes = {
  'house': {
    Icon: () => <Home className="w-3.5 h-3.5" />,
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    text: 'House'
  },
  'office': {
    Icon: () => <Building2 className="w-3.5 h-3.5" />,
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    text: 'Office'
  },
  'hall': {
    Icon: () => <Landmark className="w-3.5 h-3.5" />,
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/40',
    textColor: 'text-green-400',
    text: 'Hall'
  },
  'apartment': {
    Icon: () => <Building className="w-3.5 h-3.5" />,
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    text: 'Apartment'
  },
  'commercial': {
    Icon: () => <Briefcase className="w-3.5 h-3.5" />,
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    textColor: 'text-yellow-400',
    text: 'Commercial Space'
  },
  'studio': {
    Icon: () => <Sofa className="w-3.5 h-3.5" />,
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-400',
    text: 'Studio'
  },
  'villa': {
    Icon: () => <Castle className="w-3.5 h-3.5" />,
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-400',
    text: 'Villa'
  },
  'shop': {
    Icon: () => <Store className="w-3.5 h-3.5" />,
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    text: 'Shop'
  },
  'penthouse': {
    Icon: () => <Crown className="w-3.5 h-3.5" />,
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    text: 'Penthouse'
  },
};

function TakaDisplay(amount: number) {
  const formattedTaka = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0 // Removes decimal points (.00) if not needed
  }).format(amount);

  return formattedTaka;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function FeaturedCard({ property, state, isLoggedIn, userBalance }: { property: any; state: CardState, isLoggedIn: boolean, userBalance: number }) {
  const animProps =
    state === 'active' ? { scale: 1, opacity: 1 } :
      state === 'visible' ? { scale: 0.97, opacity: 0.72 } :
        { scale: 0.93, opacity: 0.38 };

  return (
    <motion.div
      animate={animProps}
      whileHover={{
        scale: 1.05,
        y: -14,
        zIndex: 30,
        boxShadow: '0 28px 56px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.35)',
        opacity: 1,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative flex flex-col bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl h-full"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden shrink-0">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/10 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${propertyTypes[property.type as keyof typeof propertyTypes]?.bgColor || 'bg-purple-500/20'
            } ${propertyTypes[property.type as keyof typeof propertyTypes]?.borderColor || 'border-purple-500/40'
            } ${propertyTypes[property.type as keyof typeof propertyTypes]?.textColor || 'text-purple-400'
            }`}>
            {propertyTypes[property.type as keyof typeof propertyTypes]?.Icon() || <Home className="w-3.5 h-3.5" />}
            {propertyTypes[property.type as keyof typeof propertyTypes]?.text || "Property"}
          </span>
        </div>

        {/* Tag */}
        {property.tag && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0D0D0D]/80 backdrop-blur-md border border-white/10 text-white">
              <Sparkles className="w-3 h-3 text-[#F59E0B]" /> {property.tag}
            </span>
          </div>
        )}

        {/* Save Button */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-col items-end gap-2">
          <SaveButton
            propertyId={property.id}
            initialSavedState={property.isSaved}
            styleType="card" />
        </div>

        {/* Contact info */}
        <div className={`absolute inset-x-15 bottom-3 z-10`}>
          <CardUnlockButton
            propertyId={property.id}
            isUnlockedInitially={property.hasUnlocked}
            isLoggedIn={isLoggedIn}
            userBalance={userBalance}
          />
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-md rounded-lg px-2 py-1">
          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-white text-xs font-semibold">{property.averageRating}</span>
          <span className="text-gray-500 text-xs">({property.reviewCount})</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {property.status === "active" && <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />}
            <span className="text-gray-500 text-xs">Verified listing</span>
          </div>
          <h3 className="font-['Space_Grotesk'] text-white font-semibold leading-snug">
            {property.title}
          </h3>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-600" />
            {property.zone.name}, {property.zone.city}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <HousePlus className="w-3.5 h-3.5 text-gray-600" />
          <span>{property.roomCount} {property.roomCount === 1 ? "room" : "rooms"}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map((amenity: string) => (
            <span key={amenity} className="flex items-center gap-1 text-xs text-gray-400 bg-white/[0.05] border border-white/[0.07] px-2 py-1 rounded-lg">
              {A_ICONS[amenity.toLowerCase()] ? A_ICONS[amenity.toLowerCase()] : <Check className="w-3.5 h-3.5" />}{amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-xs text-gray-600 px-1 py-1">+{property.amenities.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <span className="text-gray-600 text-xs block">Starting from</span>
            <span className="text-white font-['Space_Grotesk'] font-semibold text-sm">{TakaDisplay(property.price)} <span className="text-xs text-gray-600"> {property.priceType !== "one-time" ? " / " + property.priceType : ""}</span></span>
          </div>
          <Link href={`/listings/${property.slug}`}
            className="text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] px-4 py-2 rounded-lg transition-all font-semibold keep-white"
            onClick={e => e.stopPropagation()}
          >
            View →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Condensed dot pagination ─────────────────────────────────────────────────
function DotPager({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
  const MAX = 7;
  if (total <= MAX) {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === current
              ? 'w-6 h-1.5 bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]'
              : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
              }`}
          />
        ))}
      </div>
    );
  }

  let start = Math.max(0, Math.min(current - 3, total - MAX));
  const dots = Array.from({ length: MAX }, (_, i) => start + i);

  return (
    <div className="flex items-center gap-2">
      {start > 0 && <span className="text-gray-600 text-xs">…</span>}
      {dots.map(i => (
        <button
          key={i}
          onClick={() => onChange(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${i === current
            ? 'w-6 h-1.5 bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]'
            : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
            }`}
        />
      ))}
      {start + MAX < total && <span className="text-gray-600 text-xs">…</span>}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function FeaturedListings({ isLoggedIn, userBalance }: { isLoggedIn: boolean, userBalance: number }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ADDED: State to hold the fetched data
  const [rawProperties, setRawProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ADDED: useEffect to fetch data on the client side without blocking the render
  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await getTopRatedProperties();
        setRawProperties(data || []);
      } catch (error) {
        console.error("Failed to fetch top properties:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Empty array ensures this only runs once on mount

  const properties = rawProperties.map((p: any) => ({
    ...p.property,
    zone: p.zone || { name: 'Unknown Area' },
    image: p.property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    reviewCount: p.property.totalReviews || 0,
    capacity: p.property.roomCount ? p.property.roomCount * 2 : 2,
    amenities: p.property.amenities && p.property.amenities.length > 0 ? p.property.amenities : ['WiFi', 'AC'],
    tag: p.property.averageRating >= 4.5 ? 'Top Rated' : null,
    isSaved: !!p.savedId,
    hasUnlocked: !!p.unlockedId
  }));

  const total = properties.length;
  const GAP = 16;
  const PEEK = 40;

  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const cols = containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1;

  const cardW =
    cols === 1
      ? Math.max(180, containerWidth - 2 * PEEK - GAP)
      : Math.floor((containerWidth - GAP * (cols - 1)) / cols);

  const step = cardW + GAP;
  const maxIdx = Math.max(0, total - cols);

  const snapTo = (idx: number) => setCurrent(Math.max(0, Math.min(idx, maxIdx)));

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const { offset, velocity } = info;
    const fastSwipe = Math.abs(velocity.x) > 400;
    const longSwipe = Math.abs(offset.x) > cardW * 0.3;
    if (fastSwipe || longSwipe) {
      offset.x < 0 ? snapTo(current + 1) : snapTo(current - 1);
    }
  };

  const trackX = -(current * step);
  const dotCount = maxIdx + 1;

  const cardState = (i: number): CardState => {
    if (i === current) return 'active';
    if (i > current && i < current + cols) return 'visible';
    return 'hidden';
  };

  // ADDED: Simple loading state while data fetches
  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 flex items-center justify-center">
        <div className="text-[#3B82F6] animate-pulse font-['Space_Grotesk'] text-xl">Loading Featured Spaces...</div>
      </section>
    );
  }

  // ADDED: Empty state if no properties are found
  if (properties.length === 0) {
    return (
      <section className="py-24 flex justify-center text-white">
        <h2>No properties Found!</h2>
      </section>
    );
  }

  return (
    <section id="browse" className="py-16 sm:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-bold text-white">
            প্রিমিয়াম স্পেস,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">
              শতভাগ যাচাইকৃত
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg px-2 sm:px-0">
            আপনার প্রয়োজন অনুযায়ী বাছাই করা ভালো জায়গাগুলো দেখে নিন।
          </p>
        </div>

        <div>
          <div
            ref={containerRef}
            className="relative overflow-hidden py-6"
            style={{ touchAction: 'pan-y', cursor: 'grab' }}
          >
            <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-12 z-10 bg-gradient-to-r from-[#0D0D0D] to-transparent" />
            <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-12 z-10 bg-gradient-to-l from-[#0D0D0D] to-transparent" />

            <motion.div
              className="flex"
              style={{
                gap: GAP,
                willChange: 'transform',
                paddingLeft: cols === 1 ? PEEK : 0,
                paddingRight: cols === 1 ? PEEK : 0,
              }}
              animate={{ x: trackX }}
              transition={{ type: 'spring', stiffness: 300, damping: 34, mass: 0.8 }}
              drag="x"
              dragConstraints={{ left: -(maxIdx * step), right: 0 }}
              dragElastic={{ left: 0.05, right: 0.05 }}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
            >
              {properties.map((property, i) => (
                <div
                  key={property.id}
                  style={{ width: cardW, flexShrink: 0 }}
                >
                  <FeaturedCard
                    property={property}
                    state={cardState(i)}
                    isLoggedIn={isLoggedIn}
                    userBalance={userBalance}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-2.5 mt-4">
            <DotPager total={dotCount} current={current} onChange={snapTo} />
            <p className="text-gray-600 text-[10px] sm:text-xs tracking-widest uppercase">
              swipe to explore
            </p>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link href="/listings"
            className="text-white bg-[#3B82F6] hover:bg-[#2563EB] px-10 py-3.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 keep-white"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
}