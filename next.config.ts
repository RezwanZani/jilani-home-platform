import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Your Image Whitelists
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Pro-Tip: Add your Cloudflare R2 domain here so Next.js <Image> allows it!
      // Replace with your actual R2 domain from your .env
      {
        protocol: 'https',
        hostname: 'https://pub-6aea815763c94fd78eea844435f491df.r2.dev',
      },
    ],
  },

  // 2. Your Server Action Settings
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Bypasses the 1MB payload limit for file uploads
    },
  },
};

export default nextConfig;