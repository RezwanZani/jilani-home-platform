import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, MapPin, Users, Star, Lock, CheckCircle2,
  Wifi, Car, Wind, Mic2, Projector, UtensilsCrossed,
  Phone, Mail, Shield, Sparkles, ChevronRight, Share2, Heart,
  Calendar, Clock, Building2, Check, Home, Landmark, Building,
  Briefcase, Castle, Store, Crown, Dumbbell, ShieldCheck, ArrowUpDown,
  Sofa, Zap, Flame, Waves, Coffee, Cctv, HousePlus,
  Refrigerator, Microwave, Tv, Flower,
  Ruler,
  Eye
} from 'lucide-react';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PhotoGallery from '@/components/listings/individual/PhotoGallery';
import SimilarListings from '@/components/listings/individual/SimilarListings';
import SaveButton from '@/components/listings/SaveButton';
import ShareButton from '@/components/listings/individual/ShareButton';
import ReviewSection from '@/components/listings/individual/ReviewSection';
import ContactInfoReveal from '@/components/listings/individual/ContactInfoReveal';
import LocationAndContact from '@/components/listings/individual/LocationAndContact';

// Actions & Types
import { getPropertyBySlug, getSimilarProperties } from '@/lib/actions/property-actions';
import { checkIfPropertyIsSaved } from '@/lib/actions/save-actions';
import { Listing } from '@/types/listings';
import { auth } from '@/lib/auth';
import { getUserBalance } from '@/lib/actions/unlock-actions';
import { trackPropertyView } from '@/lib/actions/view-actions';

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const A_ICONS: Record<string, React.ReactNode> = {
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
  'house': { Icon: () => <Home className="w-3.5 h-3.5" />, bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/40', textColor: 'text-purple-400', text: 'House' },
  'office': { Icon: () => <Building2 className="w-3.5 h-3.5" />, bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/40', textColor: 'text-blue-400', text: 'Office' },
  'hall': { Icon: () => <Landmark className="w-3.5 h-3.5" />, bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40', textColor: 'text-green-400', text: 'Hall' },
  'apartment': { Icon: () => <Building className="w-3.5 h-3.5" />, bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/40', textColor: 'text-orange-400', text: 'Apartment' },
  'commercial': { Icon: () => <Briefcase className="w-3.5 h-3.5" />, bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40', textColor: 'text-yellow-400', text: 'Commercial Space' },
  'studio': { Icon: () => <Sofa className="w-3.5 h-3.5" />, bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/40', textColor: 'text-pink-400', text: 'Studio' },
  'villa': { Icon: () => <Castle className="w-3.5 h-3.5" />, bgColor: 'bg-teal-500/20', borderColor: 'border-teal-500/40', textColor: 'text-teal-400', text: 'Villa' },
  'shop': { Icon: () => <Store className="w-3.5 h-3.5" />, bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/40', textColor: 'text-indigo-400', text: 'Shop' },
  'penthouse': { Icon: () => <Crown className="w-3.5 h-3.5" />, bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/40', textColor: 'text-cyan-400', text: 'Penthouse' },
};

const AMENITY_LABELS: Record<string, string> = {
  'wifi': "High Speed Wifi", 'parking': "Parking Available", 'ac': "Air Conditioning", 'stage': "Professional Stage",
  'projector': "Projector & Screen", 'catering': "Catering Service", 'gym': "Gym", 'security': "Security",
  'cctv': "CCTV", 'elevator': "Elevator", 'furnished': "Furnished", 'power backup': "Power Backup",
  'heating': "Heating", 'swimming pool': "Swimming Pool", 'kitchen': "Kitchen", 'tv': "TV",
  'refrigerator': "Refrigerator", 'microwave': "Microwave", 'balcony': "Balcony", 'freeze': "Fridge",
};

function TakaDisplay(amount: number) {
  return `৳ ${amount}`
}

type DetailListing = Listing & { images: string[]; videoUrl?: string | null };

export default async function ListingDetail(props: { params: Promise<{ slug: string }> }) {
  // 1. Next.js 15: Await the params Promise
  const params = await props.params;

  // 2. Fetch data directly on the server
  const { data: propData } = await getPropertyBySlug(params.slug);

  if (!propData) {
    return notFound();
  }

  // Fire the tracking in the background asynchronously. 
  // Notice there is NO 'await' here!
  trackPropertyView(propData.property.id);

  // Fetch User Balance
  const userBalance = await getUserBalance();

  // Extracted secure properties from our updated Server Action
  const hasUnlocked = propData.hasUnlocked;
  const protectedContact = propData.protectedContact;

  // 3. Get User Session
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  const item = propData;
  const listing: DetailListing = {
    id: item.property.id.toString(),
    slug: item.property.slug,
    title: item.property.title,
    image: item.property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
    images: Array.isArray(item.property.images) && item.property.images.length > 0
      ? item.property.images
      : [item.property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800'],
    type: item.property.type || 'House',
    area: item.zone?.name || 'Unknown Area',
    city: item.zone?.city || 'Unknown City',
    description: item.property.description || 'No description provided.',
    roomCount: item.property.roomCount || 0,
    sizeSqft: item.property.sizeSqft || 0,
    capacity: item.property.roomCount ? item.property.roomCount * 2 : 50,
    rating: Number(item.property.averageRating) || 0,
    reviews: Number(item.property.totalReviews) || 0,
    price: TakaDisplay(Number(item.property.price)),
    viewsCount: item.property.viewsCount || 0,
    priceType: item.property.priceType,
    amenities: Array.isArray(item.property.amenities) ? item.property.amenities : ['WiFi'],
    verified: item.property.status === 'active',
    tag: Number(item.property.averageRating) >= 4.5 ? 'Top Rated' : null,
    videoUrl: item.property.videoUrl || null,
  };

  // 4. Fetch the boolean states and similar properties concurrently for speed
  const [isCurrentlySaved, { data: simData }] = await Promise.all([
    checkIfPropertyIsSaved(listing.id),
    getSimilarProperties(item.property.type, item.property.id)
  ]);

  const similar: Listing[] = simData.map((s: any) => ({
    id: s.property.id.toString(), title: s.property.title,
    slug: s.property.slug,
    image: s.property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
    type: s.property.type,
    area: s.zone?.name || 'Unknown Area', city: s.zone?.city || 'Unknown City',
    description: s.property.description || '', capacity: s.property.roomCount ? s.property.roomCount * 2 : 50,
    sizeSqft: s.property.sizeSqft || 0,
    priceType: s.property.priceType || 'one-time',
    roomCount: s.property.roomCount || 0,
    rating: Number(s.property.averageRating) || 0, reviews: Number(s.property.totalReviews) || 0,
    price: TakaDisplay(Number(s.property.price)),
    viewsCount: s.property.viewsCount || 0,
    amenities: Array.isArray(s.property.amenities) ? s.property.amenities : [],
    verified: s.property.status === 'active', tag: null
  }));

  const propType = propertyTypes[listing.type.toLowerCase()] || propertyTypes['house'];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* ── Page header ── */}
      <div className="border-b border-white/[0.06] px-[0px] pt-[105px] pb-[24px]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> <ChevronRight className="w-3 h-3" />
                <Link href="/listings" className="hover:text-white transition-colors">Listings</Link> <ChevronRight className="w-3 h-3" />
                <span className="text-gray-400 truncate max-w-[200px]">{listing.title}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center ${propType.bgColor} ${propType.borderColor} ${propType.textColor}`}>
                  {propType.Icon && propType.Icon()} <span className='ml-2'>{propType.text}</span>
                </span>

                {listing.verified && <span className="flex items-center gap-1 text-xs text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Verified</span>}
                {listing.tag && <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white"><Sparkles className="w-3 h-3 text-[#F59E0B]" /> {listing.tag}</span>}
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">{listing.title}</h1>
              <p className="flex items-center gap-1.5 text-gray-400 text-sm mt-1"><MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {listing.area}, {listing.city}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/listings">
                <button className="flex items-center gap-1.5 bg-[#141414] border border-white/[0.08] text-gray-300 hover:text-white text-sm px-4 py-2 rounded-xl transition-all hover:border-white/20">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </Link>

              {/* Server-Injected Save Button */}
              <SaveButton propertyId={listing.id} initialSavedState={isCurrentlySaved} styleType="detail" />

              <ShareButton title={listing.title} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-0 space-y-6">
            <PhotoGallery images={listing.images} title={listing.title} videoUrl={listing.videoUrl} />

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              {[
                { icon: <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />, label: `${listing.rating} rating`, sub: `${listing.reviews} reviews` },
                { icon: <HousePlus className="w-4 h-4 text-[#3B82F6]" />, label: `Up to ${listing.roomCount}`, sub: 'Rooms' },
                { icon: <Ruler className="w-4 h-4 text-[#3B82F6]" />, label: `${listing.sizeSqft || 0} sqft`, sub: 'Big Space' },
                { icon: <Eye className="w-4 h-4 text-[#3B82F6]" />, label: `${listing.viewsCount} views`, sub: 'Property Views' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#111111] border border-white/[0.07] rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center shrink-0">{s.icon}</div>
                  <div><p className="text-white text-sm font-medium">{s.label}</p><p className="text-gray-500 text-xs">{s.sub}</p></div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
              <h2 className="font-heading text-white font-semibold mb-3">About This Space</h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
              <h2 className="font-heading text-white font-semibold mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {listing.amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">{A_ICONS[a.toLowerCase()] || <Check className="w-4 h-4" />}</div>
                    <span className="text-gray-300 text-sm">{AMENITY_LABELS[a.toLowerCase()] ?? a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── NEW DETAILED LOCATION & CONTACT SECTION ── */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
              <LocationAndContact
                propertyId={listing.id}
                zone={propData.zone} // Pass the zone data from the server
                hasUnlockedInitially={hasUnlocked}
                initialContactData={protectedContact}
                isLoggedIn={isLoggedIn}
                userBalance={userBalance as number}
              />
            </div>

            {/* Reviews Section */}
            <div className="mt-10">
              <ReviewSection
                propertyId={listing.id}
                averageRating={listing.rating}
                totalReviews={listing.reviews}
                isLoggedIn={isLoggedIn}
                hasUnlocked={hasUnlocked}
              />
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="w-full lg:w-80 shrink-0 self-start sticky top-24 space-y-4">
            <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100 fill-mode-both">
              <div className="mb-3">
                <span className="text-gray-500 text-xs block mb-1">Starting from</span>
                <span className="font-heading text-3xl font-bold text-white">
                  {listing.price}
                  <span className='text-sm text-gray-400'> ({listing.priceType === 'year' ? 'per year' : listing.priceType === 'month' ? 'per month' : listing.priceType === 'day' ? 'per day' : 'One Time'})</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-white font-medium">{listing.rating}</span>
                <span className="text-gray-500 text-sm">({listing.reviews} reviews)</span>
              </div>

              {/* ── INTERACTIVE UNLOCK REVEAL COMPONENT ── */}
              <ContactInfoReveal
                propertyId={listing.id}
                hasUnlockedInitially={hasUnlocked}
                zone={propData.zone} // Pass the zone data from the server
                initialContactData={protectedContact}
                isLoggedIn={isLoggedIn}
                approximateArea={listing.area}
                userBalance={userBalance as number}
              />
              {/* ─────────────────────────────────────── */}

              <p className="text-gray-600 text-xs text-center">Pay once · See the contact details for two months.</p>
            </div>

            <div className="bg-[#3B82F6]/[0.07] border border-[#3B82F6]/20 rounded-2xl p-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-300 fill-mode-both">
              <div className="flex items-start gap-3"><Lock className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" /><p className="text-gray-400 text-xs leading-relaxed">Price, capacity, amenities and approximate location are <span className="text-white">free to view</span>. Sign up once to unlock the exact address, phone number and email.</p></div>
            </div>
          </div>
        </div>

        <SimilarListings similar={similar} />
      </div>

      <Footer />
    </div>
  );
}
