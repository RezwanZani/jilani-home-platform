'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
    ArrowLeft, MapPin, Users, Star, Lock, CheckCircle2,
    Wifi, Car, Wind, Mic2, Projector, UtensilsCrossed,
    Phone, Mail, Shield, Sparkles, ChevronRight, Share2, Heart,
    Calendar, Clock, Building2, Check, Home, Landmark, Building,
    Briefcase, Castle, Store, Crown, Dumbbell, ShieldCheck, ArrowUpDown,
    Sofa, Zap, Flame, Waves, Coffee, Cctv, HousePlus,
    Refrigerator, Microwave, Tv, Flower
} from 'lucide-react';
import { Listing } from '@/types/listings';
import SaveButton from './SaveButton';
import CardUnlockButton from './CardUnlockButton';

// Fixed keys to be strictly lowercase for robust matching
const AMENITY_ICONS: Record<string, React.ReactNode> = {
    'wifi': <Wifi className="w-3.5 h-3.5" />,
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
    'other': <Check className="w-3.5 h-3.5" />,
};

const propertyTypes: Record<string, { Icon: () => React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string; }> = {
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

const getPropertyTypeStyle = (type: string) => {
    const lowerType = type.toLowerCase();
    if (propertyTypes[lowerType]) return propertyTypes[lowerType];
    const partialMatchKey = Object.keys(propertyTypes).find(key => lowerType.includes(key));
    if (partialMatchKey) return propertyTypes[partialMatchKey];
    return {
        Icon: () => <Building className="w-3.5 h-3.5" />,
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/40',
        textColor: 'text-gray-400',
        text: type
    };
};

export default function ListingCard({
    listing,
    view,
    isLoggedIn = false,
    userBalance = 0
}: {
    listing: any;
    view: 'grid' | 'list';
    isLoggedIn?: boolean;
    userBalance?: number;
}) {
    const router = useRouter();
    const goToDetail = () => router.push(`/listings/${listing.slug}`);
    const propStyle = getPropertyTypeStyle(listing.type);

    if (view === 'list') {
        return (
            <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.3 }} onClick={goToDetail} className="flex flex-col sm:flex-row bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#3B82F6]/30 transition-all duration-300 group cursor-pointer">
                <div className="relative w-full h-44 sm:w-48 sm:h-auto shrink-0 overflow-hidden bg-gray-900">
                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                    <div className="absolute top-3 left-3 z-20">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${propStyle.bgColor} ${propStyle.borderColor} ${propStyle.textColor}`}>
                            {propStyle.Icon()} {propStyle.text}
                        </span>
                    </div>

                    {/* Stacked Save and Unlock buttons */}
                    <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
                        <SaveButton
                            propertyId={listing.id}
                            initialSavedState={listing.isSaved}
                            styleType="card"
                        />
                        <CardUnlockButton
                            propertyId={listing.id}
                            isUnlockedInitially={listing.hasUnlocked}
                            isLoggedIn={isLoggedIn}
                            userBalance={userBalance}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 py-4 px-5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {listing.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />}
                            {listing.tag && <span className="text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">{listing.tag}</span>}
                        </div>
                        <h3 className="font-['Space_Grotesk'] text-white font-semibold">{listing.title}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 shrink-0 text-gray-600" />{listing.area}, {listing.city}</p>

                        <p className="text-gray-600 text-xs mt-2 line-clamp-2">{listing.description}</p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {listing.amenities?.slice(0, 3).map((a: string) => (
                                <span key={a} className="flex items-center gap-1 text-xs text-gray-400 bg-white/[0.05] border border-white/[0.07] px-2 py-1 rounded-lg">
                                    {AMENITY_ICONS[a.toLowerCase()] || <Check className="w-3.5 h-3.5" />}{a}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-5 shrink-0">
                        <div className="flex flex-col items-center gap-0.5">
                            <HousePlus className="w-4 h-4 text-gray-500" />
                            <span className="text-white text-sm font-medium">{listing.roomCount || 0}</span>
                            <span className="text-gray-600 text-xs">{(listing.roomCount === 1) ? 'room' : 'rooms'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                            <span className="text-white text-sm font-medium">{listing.rating}</span>
                            <span className="text-gray-600 text-xs">{listing.reviews} rev.</span>
                        </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-3 sm:pt-0 border-t border-white/[0.06] sm:border-0">
                        <div className="sm:text-right">
                            <span className="text-xs text-gray-500 block">Starting from</span>
                            <span className="text-white font-['Space_Grotesk'] font-bold">{listing.price}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid View Render
    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} onClick={goToDetail} className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#3B82F6]/30 transition-all duration-300 group flex flex-col cursor-pointer">
            <div className="relative h-48 overflow-hidden bg-gray-900">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 left-3 z-20">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${propStyle.bgColor} ${propStyle.borderColor} ${propStyle.textColor}`}>
                        {propStyle.Icon()} {propStyle.text}
                    </span>
                </div>

                {/* Stacked Save, Unlock, and Tag components safely in one container */}
                <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
                    <SaveButton
                        propertyId={listing.id}
                        initialSavedState={listing.isSaved}
                        styleType="card"
                    />

                    <CardUnlockButton
                        propertyId={listing.id}
                        isUnlockedInitially={listing.hasUnlocked}
                        isLoggedIn={isLoggedIn}
                        userBalance={userBalance}
                    />

                    {listing.tag && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0D0D0D]/80 backdrop-blur-md border border-white/10 text-white">
                            <Sparkles className="w-3 h-3 text-[#F59E0B]" /> {listing.tag}
                        </span>
                    )}
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-md rounded-lg px-2 py-1 z-20">
                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-white text-xs font-semibold">{listing.rating}</span>
                    <span className="text-gray-400 text-xs">({listing.reviews})</span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        {listing.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />}
                        <span className="text-gray-100 text-xs">Verified listing</span>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-white font-semibold leading-snug group-hover:text-[#3B82F6] transition-colors line-clamp-1">{listing.title}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 shrink-0 text-gray-600" />{listing.area}, {listing.city}</p>

                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{listing.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                    <HousePlus className="w-3.5 h-3.5 text-gray-600" />
                    <span>{listing.roomCount || 0} {(listing.roomCount === 1) ? 'Room' : 'Rooms'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {listing.amenities?.slice(0, 3).map((a: string) => (
                        <span key={a} className="flex items-center gap-1 text-xs text-gray-400 bg-white/[0.05] border border-white/[0.07] px-2 py-1 rounded-lg">
                            {AMENITY_ICONS[a.toLowerCase()] || <Check className="w-3.5 h-3.5" />}{a}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
                    <div>
                        <span className="text-gray-600 text-xs block">Starting from</span>
                        <span className="inline text-white font-['Space_Grotesk'] font-semibold">{listing.price} {listing.priceType !== 'one-time' && listing.priceType ? <span className="inline text-gray-600 text-xs">&nbsp;/&nbsp;{listing.priceType}</span> : ''}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}