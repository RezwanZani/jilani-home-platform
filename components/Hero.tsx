'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Truck, Home, Search, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full flex flex-col justify-center overflow-hidden px-[16px] md:px-[24px] pt-[100px] md:pt-[130px] pb-[40px] md:pb-[60px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-image.png"
          alt="City Background"
          className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite] origin-center"
          style={{ animationDirection: 'alternate' }}
        />
        {/* Adjusted gradient for optimal readability in both modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 dark:from-[#0f172a]/85 dark:via-[#0f172a]/70 dark:to-[#0f172a]/95 backdrop-blur-[2px] dark:backdrop-blur-[3px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center text-center py-6">
        
        {/* Main Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 md:space-y-8 max-w-4xl"
        >
          <div className="space-y-6">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-[5rem] font-bold leading-[1.1] text-gray-900 dark:text-white tracking-tight">
              আপনার সঠিক <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#93C5FD]">
                ঠিকানা
              </span> <br />
              খুঁজে নিন আজই
            </h1>
            
            <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base md:text-xl max-w-[290px] sm:max-w-xl md:max-w-2xl mx-auto leading-relaxed font-light">
              বাসা ভাড়া, কেনা-বেচা এবং শিফটিং সার্ভিস এখন আরও সহজ এখন Jilani Home এর সাথে।
            </p>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 sm:gap-5 pt-2 mb-4 md:mb-12 w-full max-w-[340px] sm:max-w-none mx-auto">
            <Link href="/listings" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-base font-semibold px-2 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] group hover:-translate-y-0.5 keep-white">
              প্রপার্টি খুঁজুন
              <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#how-it-works" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-white bg-black/40 dark:bg-white/10 hover:bg-black/50 dark:hover:bg-white/20 border border-white/20 px-2 sm:px-8 py-3.5 sm:py-4 rounded-full backdrop-blur-md transition-all duration-300 text-xs sm:text-base font-semibold group hover:-translate-y-0.5 keep-white">
              <div className="bg-white/10 dark:bg-white/20 p-1 sm:p-1.5 rounded-full group-hover:bg-white/20 dark:group-hover:bg-white/30 transition-colors">
                <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white keep-white ml-0.5" />
              </div>
              কীভাবে কাজ করে
            </a>
          </div>
        </motion.div>
      </div>

      {/* Info Strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg lg:max-w-4xl mx-auto shrink-0 mt-0 sm:mt-4"
      >
        <div className="bg-black/40 dark:bg-white/10 backdrop-blur-xl border border-white/10 dark:border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          
          <div className="grid grid-cols-2 lg:grid-cols-4">
            
            {/* Item 1 */}
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 md:p-6 lg:p-8 border-b border-r border-white/10 dark:border-white/10 lg:border-b-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-center mt-1">
                <span className="text-white font-medium text-[13px] sm:text-sm md:text-base whitespace-nowrap keep-white">শিফট করুন।</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 md:p-6 lg:p-8 border-b border-white/10 dark:border-white/10 lg:border-b-0 lg:border-r">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div className="text-center mt-1">
                <span className="text-white font-medium text-[13px] sm:text-sm md:text-base whitespace-nowrap keep-white">ভাড়া দিন।</span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 md:p-6 lg:p-8 border-r border-white/10 dark:border-white/10 lg:border-r-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-center mt-1">
                <span className="text-white font-medium text-[13px] sm:text-sm md:text-base whitespace-nowrap keep-white">প্রপার্টি খুঁজুন।</span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 md:p-6 lg:p-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
              <div className="text-center mt-1">
                <span className="text-white font-medium text-[13px] sm:text-sm md:text-base whitespace-nowrap keep-white">২৪ ঘন্টায় প্রপার্টি নিন।</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

    </section>
  );
}
