import { Analytics } from '@vercel/analytics/react';
import localFont from 'next/font/local';
import { SVGSprites } from './SVGSprites/SVGSprites';
import { ServiceWorkerCleanup } from './ServiceWorkerCleanup';
import './globals.scss';

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
        {children}
        <Analytics />
        <PerformanceDashboard />
        <ServiceWorkerCleanup />
      </body>
    </html>
  );
}
