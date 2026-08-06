import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import localFont from 'next/font/local';
import { SVGSprites } from './SVGSprites/SVGSprites';
import { ServiceWorkerCleanup } from './ServiceWorkerCleanup';
import './globals.scss';

import {
  BrandProvider,
  ReducedMotionProvider,
  InteractionProvider,
  UserProvider,
} from '@/context';
import Navbar from '@/ui/modules/Navbar';
import Footer from '@/ui/modules/Footer';
import SlinkyCursor from '@/ui/components/SlinkyCursor';
import PerformanceDashboard from '@/ui/modules/PerformanceDashboard/PerformanceDashboard';
import { env } from '@/utils/env';

/**
 * Origin all pages' Open Graph / Twitter images resolve against.
 * Mirrors the NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_VERCEL_URL precedence used
 * by utils/supabase/redirectOrigin.ts, so preview deployments get their own
 * social-image origin instead of falling through to production or localhost.
 */
function resolveMetadataBase(): URL {
  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(env.NEXT_PUBLIC_SITE_URL);
    } catch {
      // invalid site URL config — fall through to Vercel/production handling
    }
  }

  if (env.NEXT_PUBLIC_VERCEL_URL) {
    const vercelHost = env.NEXT_PUBLIC_VERCEL_URL.replace(/^https?:\/\//, '');
    return new URL(`https://${vercelHost}`);
  }

  return new URL('https://darianrosebrook.com');
}

/**
 * metadataBase anchors relative Open Graph / Twitter image URLs. Without it,
 * Next.js falls back to http://localhost:PORT, which breaks social link
 * previews for shared articles and case studies in production.
 */
export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
};

// If loading a variable font, you don't need to specify the font weight
const nohemi = localFont({
  src: '../public/fonts/Nohemi-VF.ttf',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
  weight: '100 900',
  variable: '--font-nohemi',
  adjustFontFallback: 'Arial',
});
const inter = localFont({
  src: '../public/fonts/InterVariable.ttf',
  fallback: ['system-ui', 'sans-serif'],
  display: 'swap',
  preload: true,
  weight: '100 900',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
});

/**
 * Top-level navigation pages for the main Navbar.
 */
const pages = [
  { name: 'Blueprints', path: 'blueprints', admin: false },
  { name: 'Articles', path: 'articles', admin: false },
  { name: 'Work', path: 'work', admin: false },
  { name: 'Design Tools', path: 'tools', admin: false },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${nohemi.variable}`}>
      <head>
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//wrgenoqnojvalkscpiib.supabase.co" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="//cdn.bsky.app" />
        <link rel="dns-prefetch" href="//video.bsky.app" />
      </head>
      <body>
        <SVGSprites />
        {/*
          Global providers and chrome live in the root layout so they mount
          once and persist across client navigations. They previously lived in
          template.tsx, which Next.js remounts on every navigation — that reset
          provider state and made UserProvider re-run auth.getUser() on each
          route change.
        */}
        <BrandProvider>
          <ReducedMotionProvider>
            <InteractionProvider>
              <UserProvider>
                <Navbar pages={pages} />
                {children}
                <Footer />
                <SlinkyCursor />
              </UserProvider>
            </InteractionProvider>
          </ReducedMotionProvider>
        </BrandProvider>
        <Analytics />
        {/*
          PerformanceDashboard is dev-only instrumentation. Gating on NODE_ENV
          keeps it from rendering or executing for end users and lets the
          bundler drop it from production builds.
        */}
        {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
        <ServiceWorkerCleanup />
      </body>
    </html>
  );
}
