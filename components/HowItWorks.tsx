'use client';

import { motion } from 'motion/react';
import { Search, Unlock, Phone } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  {
    icon: Search,
    title: "সেরা প্রপার্টি খুঁজুন",
    desc: "আমাদের প্ল্যাটফর্ম থেকে আপনার প্রয়োজন অনুযায়ী সবচেয়ে ভালো প্রপার্টিগুলো খুঁজে বের করুন।"
  },
  {
    icon: Unlock,
    title: "পয়েন্ট দিয়ে আনলক করুন",
    desc: "অ্যাকাউন্ট খুলে পয়েন্ট রিচার্জ করুন এবং পয়েন্ট ব্যবহার করে প্রপার্টির মালিকের নম্বর ও বিস্তারিত তথ্য আনলক করুন।"
  },
  {
    icon: Phone,
    title: "সরাসরি যোগাযোগ করুন",
    desc: "কোনো প্রকার ব্রোকার বা মাধ্যম ছাড়াই সরাসরি মালিকের সাথে কথা বলে আপনার ডিল ফাইনাল করুন।"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#0a0a0a] border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3B82F6]/5 via-[#0D0D0D] to-[#0D0D0D] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-bold text-white">
            কীভাবে <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">কাজ করে</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            প্রিমিয়াম স্পেস খুঁজে পেতে এবং বুকিং নিশ্চিত করতে একটি সহজ ও সাবলীল প্রক্রিয়া
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent" />

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col items-center text-center relative group"
                >
                  <div className="w-24 h-24 rounded-full bg-[#141414] border border-[#3B82F6]/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 relative z-10 group-hover:-translate-y-2">
                    <Icon className="w-10 h-10 text-[#3B82F6] transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[#3B82F6] text-sm font-bold opacity-50">0{index + 1}</span>
                      <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white tracking-wide">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xs mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
