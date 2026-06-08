'use client';

import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTheme } from '@/providers/ThemeProvider';

interface PricingClientProps {
  packages: any[];
}

function PlanCard({ plan, index, isLight }: { plan: any; index: number; isLight: boolean }) {
  // ── Colour tokens ──────────────────────────────────────────────────────────
  const cardBg        = isLight ? '#FFFFFF'                    : '#111111';
  const cardBorder    = plan.isPopular
    ? 'rgba(59,130,246,0.4)'
    : isLight ? 'rgba(13,13,13,0.10)' : 'rgba(255,255,255,0.07)';
  const cardShadow    = plan.isPopular
    ? isLight
      ? '0 0 40px rgba(59,130,246,0.12), 0 4px 24px rgba(0,0,0,0.07)'
      : '0 0 40px rgba(59,130,246,0.15)'
    : isLight
      ? '0 2px 16px rgba(0,0,0,0.06)'
      : 'none';

  const planNameColor = plan.isPopular ? '#3B82F6' : isLight ? '#6B7280' : '#9CA3AF';
  const priceColor    = isLight ? '#0D0D0D' : '#FFFFFF';
  const subColor      = isLight ? '#9CA3AF' : '#6B7280';
  const descColor     = isLight ? '#6B7280' : '#9CA3AF';

  const ctaBg         = plan.isPopular
    ? '#3B82F6'
    : isLight ? 'rgba(13,13,13,0.06)' : 'rgba(255,255,255,0.07)';
  const ctaHoverBg    = plan.isPopular ? '#2563EB'
    : isLight ? 'rgba(13,13,13,0.10)' : 'rgba(255,255,255,0.12)';
  const ctaBorder     = plan.isPopular
    ? 'transparent'
    : isLight ? 'rgba(13,13,13,0.12)' : 'rgba(255,255,255,0.10)';
  const ctaTextColor  = plan.isPopular ? '#FFFFFF' : isLight ? '#0D0D0D' : '#FFFFFF';

  const dividerColor  = isLight ? 'rgba(13,13,13,0.08)' : 'rgba(255,255,255,0.07)';
  const sectionLabel  = isLight ? '#9CA3AF' : '#6B7280';

  const inclIconBg    = 'rgba(59,130,246,0.13)';
  const inclTextColor = isLight ? '#374151' : '#D1D5DB';

  const featuresList = Array.isArray(plan.features) ? plan.features : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
      }}
    >
      {/* Featured glow top bar */}
      {plan.isPopular && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent" />
      )}

      <div className="p-7 flex-1 flex flex-col">
        {/* Plan header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: planNameColor, fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {plan.name}
            </span>
            {plan.isPopular && (
              <span
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{
                  color: '#3B82F6',
                  borderColor: 'rgba(59,130,246,0.3)',
                  background: 'rgba(59,130,246,0.08)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Most Popular
              </span>
            )}
          </div>

          <div className="flex items-end gap-1 mt-2 mb-3">
            <span
              className="leading-none"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '2.75rem',
                color: priceColor,
              }}
            >
              ৳{Number(plan.price).toLocaleString()}
            </span>
          </div>

          <p className="text-sm" style={{ color: descColor, fontFamily: 'Inter, sans-serif' }}>
            {plan.points} Points
          </p>
        </div>

        {/* CTA */}
        <Link href="/dashboard/store"
          className="w-full py-2.5 px-5 rounded-xl text-sm font-medium text-center transition-all duration-200 mb-6"
          style={{
            fontFamily: 'Inter, sans-serif',
            background: ctaBg,
            color: ctaTextColor,
            border: `1px solid ${ctaBorder}`,
            boxShadow: plan.isPopular ? '0 0 20px rgba(59,130,246,0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = ctaHoverBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = ctaBg;
          }}
        >
          Purchase Points
        </Link>

        {/* Divider + features label */}
        <div className="mb-4">
          <div className="h-px w-full mb-4" style={{ background: dividerColor }} />
          <span
            className="text-xs uppercase"
            style={{ color: sectionLabel, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}
          >
            Included in {plan.name}:
          </span>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3">
          {featuresList.map((feature: any, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: inclIconBg,
                }}
              >
                <Check className="w-3 h-3" style={{ color: '#3B82F6' }} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col">
                <span
                  className="text-sm"
                  style={{
                    color: inclTextColor,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {feature.text}
                </span>
                {feature.text_bn && (
                  <span className="text-xs text-gray-500 font-bengali mt-0.5">
                    {feature.text_bn}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function PricingClient({ packages }: PricingClientProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // ── Page-level colour tokens ───────────────────────────────────────────────
  const pageBg         = isLight ? '#F5F6F8' : '#0D0D0D';
  const subtitleColor  = isLight ? '#6B7280'  : '#9CA3AF';

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: pageBg, fontFamily: 'Inter, sans-serif' }}
    >
      <Navbar />

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Hero text ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="text-center mb-16"
          >
            <h1
              className="mb-4 text-gray-900 dark:text-white"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                lineHeight: 1.15,
              }}
            >
              Simple, transparent Pricing
            </h1>
            <p
              className="max-w-xl mx-auto"
              style={{
                color: subtitleColor,
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                lineHeight: 1.7,
              }}
            >
              Purchase points to unlock direct venue contact access,
              priority results, and unlimited opportunities.
            </p>
          </motion.div>

          {/* ── Pricing cards ──────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {packages.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} index={i} isLight={isLight} />
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      <Footer />
    </div>
  );
}
