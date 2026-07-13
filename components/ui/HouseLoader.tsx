"use client";

import React, { useState, useEffect } from "react";

interface HouseLoaderProps {
    /** Optional manual progress tracking (0-100). Self-simulates seamlessly if undefined. */
    value?: number;
    /** Whether the loader should act as a full-screen overlay */
    isOverlay?: boolean;
}

export default function HouseLoader({ value }: HouseLoaderProps) {
    const [progress, setProgress] = useState(value ?? 0);

    // Simulate progress accurately up to 100% if no live metrics arrive
    useEffect(() => {
        if (value !== undefined) {
            setProgress(value);
            return;
        }

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return prev;
                const randomStep = Math.floor(Math.random() * 10) + 4;
                return Math.min(prev + randomStep, 100);
            });
        }, 280);

        return () => clearInterval(progressInterval);
    }, [value]);

    // SVG Circular Progress Math
    const size = 160;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 dark:bg-[#0a0a0a]/70 backdrop-blur-md transition-colors duration-300 select-none">

            <div className="relative flex items-center justify-center w-40 h-40">

                {/* --- MAGIC SPINNERS (Bluish Theme) --- */}
                <div className="absolute inset-[-15px] rounded-full border-[3px] border-transparent border-t-cyan-400 border-b-blue-600 dark:border-t-cyan-300 dark:border-b-blue-500 animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-[-30px] rounded-full border-[2px] border-transparent border-l-blue-400/50 border-r-indigo-500/50 dark:border-l-blue-300/50 dark:border-r-indigo-400/50 animate-[spin_3.5s_linear_infinite_reverse]" />

                {/* Core Magic Aura */}
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />

                {/* --- SVG CIRCULAR PROGRESS BAR --- */}
                <svg
                    width={size}
                    height={size}
                    className="absolute inset-0 transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                >
                    {/* Background Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-blue-100 dark:text-blue-900/30"
                    />
                    {/* Live Progress Indicator */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="text-blue-600 dark:text-cyan-400 transition-all duration-300 ease-out"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: strokeDashoffset,
                        }}
                    />
                </svg>

                {/* --- ROUNDED LOGO --- */}
                <div className="relative w-[124px] h-[124px] rounded-full overflow-hidden bg-white dark:bg-[#111] shadow-inner flex items-center justify-center border-2 border-blue-100/50 dark:border-blue-900/50 z-10">
                    {/* Day Theme Logo */}
                    <img
                        src="/imports/jilanihome_logo.jpg"
                        alt="Jilani Home"
                        className="w-[75%] h-[75%] object-contain block dark:hidden"
                    />
                    {/* Night Theme Logo */}
                    <img
                        src="/imports/jilanihome_logo.jpg"
                        alt="Jilani Home"
                        className="w-[75%] h-[75%] object-contain hidden dark:block"
                    />
                </div>

            </div>
        </div>
    );
}