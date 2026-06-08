"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "darker" | "lighter" | "solid";
  hoverable?: boolean;
}

export function GlassCard({ className, children, variant = "default", hoverable = false, ...props }: GlassCardProps) {
  const variants = {
    // default: now uses semantic bg-card for better light/dark support with a very subtle translucent feel
    default: "bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-white/5 shadow-sm backdrop-blur-md",
    // glass-style variants for that premium feel
    darker: "bg-black/40 border-white/10 backdrop-blur-xl dark:bg-black/60 shadow-2xl",
    lighter: "bg-white/30 border-white/40 backdrop-blur-lg dark:bg-white/5 shadow-xl",
    solid: "bg-white dark:bg-slate-800 border-gray-200 dark:border-white/5",
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "border rounded-2xl relative overflow-hidden transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Subtle glossy gradient overlay for that premium touch */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
