'use client';

import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Rahim Chowdhury",
    role: "Event Organizer",
    company: "Summit Events BD",
    image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwbWFufGVufDF8fHx8MTc3NjY3MTAyOHww&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Saved thousands on commission for a premium conference hall. The direct contact feature alone is worth it.",
    stars: 5,
  },
  {
    name: "Farha Ahmed",
    role: "Startup Founder",
    company: "Nexus Labs",
    image: "https://images.unsplash.com/photo-1610387694365-19fafcc86d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwd29tYW58ZW58MXx8fHwxNzc2NjY3NDUxfDA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Found the perfect coworking space in Dhanmondi. Verified contacts meant I could negotiate directly — no middleman.",
    stars: 5,
  },
  {
    name: "Marcus Vance",
    role: "Global Events Director",
    company: "Vance & Co.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    quote: "The exclusive spaces on Jilani Home completely transformed how we host international conventions. Unmatched quality.",
    stars: 5,
  },
  {
    name: "Priya Menon",
    role: "Corporate Trainer",
    company: "Elevate HR",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    quote: "Every listing I explored was exactly as described. The curation is exceptional — no wasted viewings.",
    stars: 5,
  },
  {
    name: "James Okafor",
    role: "Product Manager",
    company: "Bloom Digital",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    quote: "Booked a stunning boardroom in under 20 minutes. The platform makes discovering premium spaces effortless.",
    stars: 5,
  },
  {
    name: "Nadia Islam",
    role: "Creative Director",
    company: "Studio Arc",
    image: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    quote: "We use Jilani Home for every shoot location and client presentation. The quality bar is consistently high.",
    stars: 5,
  },
];

// Duplicate for seamless infinite scroll
const marqueeItems = [...testimonials, ...testimonials];

export default function Testimonials() {
  const featured = testimonials[0];

  return (
    <section className="py-28 relative overflow-hidden bg-[#0D0D0D]">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 w-[700px] h-[400px] bg-[#3B82F6] rounded-full blur-[180px] opacity-[0.06] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full px-4 py-1.5 mb-5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
            </div>
            <span className="text-[#3B82F6] text-xs font-semibold tracking-widest uppercase">4.9 / 5 from 500+ members</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight">
            Trusted by professionals<br className="hidden md:block" /> worldwide.
          </h2>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/[0.08] bg-[#111111] p-8 md:p-12 mb-8 overflow-hidden group"
        >
          {/* Blue accent bar */}
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-gradient-to-b from-[#3B82F6] to-[#3B82F6]/0 rounded-full" />

          {/* Large quote mark */}
          <Quote className="absolute top-8 right-8 w-16 h-16 text-[#3B82F6]/10 fill-[#3B82F6]/10" />

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <blockquote className="flex-1">
              <p className="font-heading text-white text-2xl md:text-3xl leading-relaxed font-medium">
                "{featured.quote}"
              </p>
            </blockquote>

            <div className="flex items-center gap-4 shrink-0">
              <img
                src={featured.image}
                alt={featured.name}
                className="w-14 h-14 rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="text-white font-semibold font-heading">{featured.name}</p>
                <p className="text-[#3B82F6] text-sm">{featured.role}</p>
                <p className="text-gray-500 text-xs mt-0.5">{featured.company}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Marquee Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0D0D0D] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0D0D0D] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            <div
              className="flex gap-4 w-max"
              style={{ animation: 'jh-marquee 32s linear infinite' }}
            >
              {marqueeItems.map((t, i) => (
                <div
                  key={i}
                  className="w-[300px] shrink-0 bg-[#111111] border border-white/[0.07] rounded-2xl p-6 hover:border-[#3B82F6]/30 transition-colors duration-300"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-5 line-clamp-3">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold font-heading">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Marquee keyframes */}
      <style>{`
        @keyframes jh-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
