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
