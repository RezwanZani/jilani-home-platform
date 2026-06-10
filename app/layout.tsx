import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Anek_Bangla } from 'next/font/google';
import { ThemeProvider } from '@/providers/ThemeProvider';
import '@/styles/globals.css';
import { Providers } from "./providers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

// FIX: Node v25 introduces a broken `localStorage` global object without methods.
// Many third-party libraries (like Radix UI or Framer Motion) check `typeof localStorage !== 'undefined'`
// and then crash on the server calling `.getItem()`. This safely patches it during SSR.
if (typeof global !== 'undefined' && global.localStorage && !global.localStorage.getItem) {
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
      clear: () => { },
    },
    writable: true,
  });
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const anekBangla = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jilani Home',
  description:
    'Browse verified office spaces, event halls, and residential properties. Connect directly with owners, no middlemen.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${anekBangla.variable} font-sans antialiased`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <ThemeProvider>
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
