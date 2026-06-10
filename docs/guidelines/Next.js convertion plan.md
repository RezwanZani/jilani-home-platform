---

# Vite + React → Next.js 15 Migration Architecture Plan
## Jilani Home — `Jilanihomesitedev`

---

## 1. Project Snapshot (Current State)

| Dimension | Current (Vite) | Implication for Migration |
|---|---|---|
| **Router** | `react-router` v7 (`createBrowserRouter`) | Must be replaced with Next.js App Router file-system routing |
| **Animation** | `motion/react` (Framer Motion v12) | Drop-in safe — no changes needed |
| **Theme** | Custom `ThemeProvider` + `localStorage` | Needs `'use client'` directive + SSR hydration guard |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Must migrate to `@tailwindcss/postcss` (Next.js uses PostCSS) |
| **CSS** | `tailwind.css` → `@source` directive + `tw-animate-css` | Restructure into a single `globals.css` |
| **Assets** | `src/imports/` images referenced directly | Move to `public/` or use Next.js `<Image>` |
| **Fonts** | Google Fonts via CSS `@import` | Replace with `next/font/google` |
| **Data** | Static `listings.ts` (no API) | Stays as-is; becomes a pure server import |
| **shadcn/ui** | Full Radix stack | Fully compatible, zero changes |
| **figmaAssetResolver** | Custom Vite plugin (`figma:asset/*`) | Must be removed / aliased away |
| **`pnpm-workspace`** | Configured | Keep as-is |

---

## 2. Target Architecture

```
jilanihome-next/
├── app/                          ← Next.js App Router root
│   ├── layout.tsx                ← Root layout (fonts, ThemeProvider, globals.css)
│   ├── page.tsx                  ← / (Home)
│   ├── listings/
│   │   ├── page.tsx              ← /listings
│   │   └── [id]/
│   │       └── page.tsx          ← /listings/:id  (ListingDetail)
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── pricing/
│       └── page.tsx
│
├── components/                   ← All UI components (moved from src/app/components/)
│   ├── Navbar.tsx                ← 'use client' (uses useState, motion, useTheme)
│   ├── Hero.tsx                  ← 'use client' (uses motion, Link)
│   ├── TrustStrip.tsx            ← Check if static → can be Server Component
│   ├── FeaturedListings.tsx      ← Check if static → can be Server Component
│   ├── HowItWorks.tsx            ← Check if static → can be Server Component
│   ├── Testimonials.tsx          ← Check if static → can be Server Component
│   ├── BottomCTA.tsx             ← Check if static → can be Server Component
│   ├── Footer.tsx                ← Check if static → can be Server Component
│   └── figma/
│       └── ImageWithFallback.tsx ← 'use client' (if it uses onError/state)
│
├── components/ui/                ← shadcn components — zero changes
│
├── lib/
│   └── utils.ts                  ← Moved from src/app/components/ui/utils.ts
│
├── data/
│   └── listings.ts               ← Zero changes
│
├── providers/
│   └── ThemeProvider.tsx         ← Extracted as 'use client' provider
│
├── styles/
│   └── globals.css               ← Merged from index.css + theme.css + tailwind.css + fonts.css
│
├── public/
│   ├── bg-image.jpg              ← Already here ✓
│   └── imports/                  ← Move all src/imports/* here
│       ├── jilanihome_logo.jpg
│       └── image-*.png
│
├── next.config.ts
├── postcss.config.mjs            ← Swap @tailwindcss/vite → @tailwindcss/postcss
├── tailwind.config.ts            ← (if needed for v4 compat shim)
├── tsconfig.json                 ← Update paths alias
└── package.json
```

---

## 3. Route Mapping

| Vite Route | Next.js App Router File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Renders `<Home />` |
| `/listings` | `app/listings/page.tsx` | Renders `<Listings />` |
| `/listings/:id` | `app/listings/[id]/page.tsx` | `useParams` → `{ params }` prop |
| `/login` | `app/login/page.tsx` | |
| `/signup` | `app/signup/page.tsx` | |
| `/forgot-password` | `app/forgot-password/page.tsx` | |
| `/pricing` | `app/pricing/page.tsx` | |

The `Root` layout with `<ScrollRestoration>` is replaced by Next.js's native scroll behavior. Smooth scroll is preserved via CSS `scroll-behavior: smooth` on `<html>`.

---

## 4. Phase-by-Phase Migration Plan

---

### Phase 0 — Setup

1. `npx create-next-app@latest jilanihome-next --typescript --tailwind --eslint --app --no-src-dir`
2. Copy `pnpm-workspace.yaml` over
3. Copy `package.json` dependencies — add `motion`, `next-themes` (already in deps), keep all Radix packages
4. Remove `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite` from deps
5. Add `@tailwindcss/postcss` to devDeps
6. `pnpm install`

---

### Phase 1 — CSS / Tailwind Migration

**Critical step.** Tailwind v4 works differently in Next.js vs Vite.

**`postcss.config.mjs`:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**`styles/globals.css`** — merge all four CSS files into one:
```css
/* 1. Fonts — replace @import URL with next/font/google in layout.tsx */
/* 2. Tailwind v4 */
@import 'tailwindcss';
@import 'tw-animate-css';

/* 3. @source directive — points to components and app */
@source '../app/**/*.{ts,tsx}';
@source '../components/**/*.{ts,tsx}';

/* 4. Paste full contents of theme.css */
/* 5. Paste full contents of the light-mode overrides from theme.css */
```

> ⚠️ **`@custom-variant dark (&:is(.dark *))`** in `theme.css` must be retained — this is the class-based dark mode selector that powers the entire theme system.

---

### Phase 2 — Layout + ThemeProvider

**`providers/ThemeProvider.tsx`** — extract the current `theme-context.tsx`:
```tsx
'use client';
// Paste exact ThemeProvider implementation
// Add suppressHydrationWarning on the root <html> to prevent SSR mismatch
```

**`app/layout.tsx`:**
```tsx
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/providers/ThemeProvider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

> `suppressHydrationWarning` is **mandatory** — the theme class is set client-side from `localStorage`, so server-rendered HTML will always be classless until hydration. Without this, React will throw a hydration error.

---

### Phase 3 — Component Migration

**Rule: every component that uses any of the following gets `'use client'` at the top:**

| Hook / API | Affected Components |
|---|---|
| `useState`, `useEffect`, `useRef`, `useCallback` | `Navbar`, `ListingDetail` (PhotoGallery, TourRequestPanel) |
| `motion`, `AnimatePresence` | `Navbar`, `Hero`, `ListingDetail` |
| `useTheme` | `Navbar` |
| `useNavigate`, `useParams` | `ListingDetail` |
| `window`, `localStorage`, `document` | `ThemeProvider` |

**Static components** (no interactivity, no hooks) → stay as Server Components by default:
- `TrustStrip`, `FeaturedListings`, `HowItWorks`, `Testimonials`, `BottomCTA`, `Footer`

> Verify each one by reading — if they use `motion` for scroll-triggered animations, they'll also need `'use client'`.

---

### Phase 4 — Page Migration

Each page file becomes a thin shell:

**`app/page.tsx`:**
```tsx
import Home from '@/components/pages/Home'; // or inline
export default function Page() { return <Home />; }
```

**`app/listings/[id]/page.tsx`** — special case:

`useParams` from `react-router` → in Next.js App Router, params are passed as props:

```tsx
// Before (Vite)
const { id } = useParams<{ id: string }>();

// After (Next.js) — in a 'use client' component
import { useParams } from 'next/navigation';
const { id } = useParams<{ id: string }>();
```

> ✅ `next/navigation` exports `useParams` — same API, same destructuring. Zero logic changes.

**`useNavigate`** → `useRouter` from `next/navigation`:
```tsx
// Before
const navigate = useNavigate();
navigate('/signup');

// After
const router = useRouter();
router.push('/signup');

// navigate(-1)  →  router.back()
```

---

### Phase 5 — Link + Navigation

| From (`react-router`) | To (`next/link` / `next/navigation`) |
|---|---|
| `<Link to="/listings">` | `<Link href="/listings">` |
| `<Link to={`/listings/${id}`}>` | `<Link href={`/listings/${id}`}>` |
| `<a href="/#how-it-works">` | `<a href="/#how-it-works">` ← unchanged |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useParams()` | `useParams()` from `next/navigation` |

---

### Phase 6 — Asset Migration

**Logo image fix** — `Navbar.tsx` currently references:
```
src="/src/imports/jilanihome_logo.jpg"
```
This won't work in Next.js. Move all files from `src/imports/` to `public/imports/` and update to:
```
src="/imports/jilanihome_logo.jpg"
```

**`figmaAssetResolver` Vite plugin** — this plugin resolved `figma:asset/filename` imports. Check if any component actually uses `figma:asset/` imports. If none do (none visible in the codebase), simply **remove** the plugin. If any do, replace with a static `/imports/filename` path.

**`bg-image.jpg`** — already in `public/`, no changes needed.

**Optional upgrade:** Replace `<img>` tags in `FeaturedListings`, similar listings cards, and `PhotoGallery` with Next.js `<Image>` from `next/image` for automatic optimization. This is not required but a recommended enhancement — do it after core migration is working.

---

### Phase 7 — `next.config.ts` 

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
```

This is required if you use `next/image` with Unsplash URLs.

---

### Phase 8 — `tsconfig.json` Update

Update path alias (Next.js `create-next-app` sets this, but verify):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

The current Vite config aliases `@` to `./src`. In the new structure without a `src/` folder, `@` maps to the root. All `@/` imports need to be verified they resolve correctly after restructure.

---

## 5. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| **ThemeProvider SSR hydration mismatch** | High | `suppressHydrationWarning` on `<html>` + keep `typeof window !== 'undefined'` guard in ThemeProvider |
| **Tailwind v4 `@source` misconfiguration** | High | Ensure `@source` points to all files containing Tailwind classes |
| **`motion` with Server Components** | Medium | Any component using `motion.*` must be `'use client'` |
| **`react-router` `Link` vs `next/link`** — `to` vs `href` prop | Medium | Global find-replace `to="` → `href="` inside Link tags |
| **`figma:asset/` imports not resolved** | Low | Audit all components; likely unused — remove plugin |
| **Logo path `/src/imports/`** | Medium | Move to `/public/imports/` and update all references |
| **`tw-animate-css` compat with Next.js** | Low | It's a plain CSS library — works fine via `@import` in globals.css |
| **`react-responsive-masonry` SSR** | Low | If used in listings, may need `'use client'` or dynamic import with `ssr: false` |

---

## 6. Dependency Changes Summary

**Remove:**
- `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`
- `react-router` (replaced by `next/navigation` + file-system routing)

**Add:**
- `next` (latest 15.x)
- `@tailwindcss/postcss`

**Keep everything else unchanged** — all Radix, motion, lucide-react, shadcn, MUI, embla, etc. are framework-agnostic.


---