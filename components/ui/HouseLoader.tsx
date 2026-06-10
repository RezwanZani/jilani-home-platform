"use client";

import React, { useState, useEffect } from "react";

interface HouseLoaderProps {
    /** Optional manual progress tracking (0-100). Self-simulates seamlessly if undefined. */
    value?: number;
}

const LOADING_MESSAGES = [
    "Clearing the site foundation...",
    "Laying structural pillars...",
    "Raising premium concrete frames...",
    "Assembling architectural layouts...",
    "Securing system endpoints...",
    "Polishing bilingual details...",
    "Opening doors to Jilani Home..."
];

export default function HouseLoader({ value }: HouseLoaderProps) {
    const [progress, setProgress] = useState(value ?? 0);
    const [messageIdx, setMessageIdx] = useState(0);

    // 1. Simulate progress accurately up to a hold point if no live metrics arrive
    useEffect(() => {
        if (value !== undefined) {
            setProgress(value);
            return;
        }

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 96) return prev;
                const randomStep = Math.floor(Math.random() * 10) + 4;
                return Math.min(prev + randomStep, 96);
            });
        }, 280);

        return () => clearInterval(progressInterval);
    }, [value]);

    // 2. Cycle real estate telemetry notes logs automatically
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 1600);
        return () => clearInterval(messageInterval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-md transition-colors duration-300 select-none">

            {/* --- GITHUB-STYLE TOP PROGRESS LOADER --- */}
            <div className="fixed top-0 left-0 w-full h-[2.5px] bg-zinc-200/30 dark:bg-zinc-800/30 z-[10000]">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 dark:from-amber-600 dark:via-amber-400 dark:to-yellow-300 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* --- CENTRAL FROSTED GLASS BRAND CARD --- */}
            <div className="flex flex-col items-center p-8 rounded-3xl bg-white/70 dark:bg-[#111111]/80 border border-zinc-200/60 dark:border-white/[0.06] shadow-xl max-w-xs w-full text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">

                {/* --- HOUSE BLUEPRINT VECTOR ANIMATION --- */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-zinc-700 dark:text-zinc-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {/* Structural Chimney Vapor Pings */}
                        <circle cx="72" cy="18" r="1.5" className="fill-amber-500 dark:fill-amber-400 stroke-none animate-ping [animation-duration:2s]" />
                        <circle cx="72" cy="10" r="1" className="fill-zinc-400 dark:fill-white/30 stroke-none animate-pulse [animation-duration:1.5s] delay-300" />

                        {/* Base Lot Floorline */}
                        <line
                            x1="12"
                            y1="85"
                            x2="88"
                            y2="85"
                            className="stroke-zinc-300 dark:stroke-zinc-700 animate-pulse"
                        />

                        {/* Perimeter Foundation Bricks */}
                        <rect
                            x="25"
                            y="48"
                            width="50"
                            height="37"
                            className="stroke-zinc-400 dark:stroke-zinc-500 fill-zinc-100/40 dark:fill-zinc-900/40 animate-pulse [animation-duration:3s]"
                        />

                        {/* Premium Gabled Truss A-Frame Roof */}
                        <path
                            d="M 20 48 L 50 18 L 80 48 Z"
                            className="stroke-amber-600 dark:stroke-amber-500 fill-amber-500/5 animate-[pulse_2s_infinite_400ms]"
                        />

                        {/* Chimney Stack */}
                        <path d="M 68 36 L 68 22 L 76 22 L 76 44" className="stroke-zinc-400 dark:stroke-zinc-500" />

                        {/* Grand Opening Archways */}
                        <path
                            d="M 44 85 L 44 64 L 56 64 L 56 85"
                            className="stroke-zinc-500 dark:stroke-zinc-400 fill-zinc-50/90 dark:fill-black/60"
                        />
                        {/* Door Pivot Dot */}
                        <circle cx="53" cy="74" r="0.75" className="fill-amber-600 dark:fill-amber-400 stroke-none animate-bounce" />

                        {/* Symmetrical High-Tier Windows */}
                        {/* Left Frame */}
                        <rect x="32" y="54" width="8" height="8" className="stroke-zinc-300 dark:stroke-zinc-600 fill-zinc-200 dark:fill-zinc-950" />
                        <rect x="32" y="54" width="8" height="8" className="stroke-none fill-amber-500/20 dark:fill-amber-400/20 animate-pulse" />

                        {/* Right Frame */}
                        <rect x="60" y="54" width="8" height="8" className="stroke-zinc-300 dark:stroke-zinc-600 fill-zinc-200 dark:fill-zinc-950" />
                        <rect x="60" y="54" width="8" height="8" className="stroke-none fill-amber-500/20 dark:fill-amber-400/20 animate-pulse [animation-delay:400ms]" />

                        {/* Mezzanine Accent Window */}
                        <circle cx="50" cy="34" r="4" className="stroke-amber-700/50 dark:stroke-amber-500/40 fill-zinc-200 dark:fill-zinc-950" />
                        <circle cx="50" cy="34" r="4" className="stroke-none fill-amber-500/20 dark:fill-amber-400/30 animate-pulse [animation-delay:600ms]" />
                    </svg>

                    {/* Central Radial Core Light */}
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse -z-10" />
                </div>

                {/* --- DYNAMIC LOADING CONTEXT DATA --- */}
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-zinc-800 dark:text-zinc-200 font-bold tracking-wider text-xs uppercase">
                        Jilani Home
                    </h3>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono tracking-wide h-4 transition-all duration-300">
                        {LOADING_MESSAGES[messageIdx]}
                    </p>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono mt-3 tabular-nums">
                        {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}