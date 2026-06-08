import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // 'sans' is used by default across your entire website
                sans: ['var(--font-inter)', 'var(--font-bengali)', 'sans-serif'],
                // 'heading' can be used specifically for titles
                heading: ['var(--font-space-grotesk)', 'var(--font-bengali)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;