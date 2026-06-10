
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import FeaturedListings from '@/components/FeaturedListings';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';

import { auth } from '@/lib/auth';
import { getUserBalance } from '@/lib/actions/unlock-actions'

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userBalance = await getUserBalance() as number || 0;

  return (
    <div className="min-h-screen landing-bg text-white font-sans selection:bg-[#3B82F6]/30 overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <FeaturedListings isLoggedIn={isLoggedIn} userBalance={userBalance} />
        <HowItWorks />
        {/* <Testimonials /> */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
