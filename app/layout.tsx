import { Analytics } from '@vercel/analytics/react';
import localFont from 'next/font/local';
import { ViewTransitions } from 'next-view-transitions';
import './globals.scss';
import { SVGSprites } from './SVGSprites/SVGSprites';

import PerformanceDashboard from '@/modules/PerformanceDashboard/PerformanceDashboard';
// If loading a variable font, you don't need to specify the font weight
const nohemi = localFont({
  src: '../public/fonts/Nohemi-VF.ttf',
  display: 'swap',
  fallback: ['sans-serif'],
  preload: true,
  weight: '100 900',
  variable: '--font-nohemi',
});
const inter = localFont({
  src: '../public/fonts/InterVariable.ttf',
  fallback: ['sans-serif'],
  display: 'auto',
  weight: '100 900',
  variable: '--font-inter',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable} ${nohemi.variable}`}>
        <head>
          {/* Preload critical resources */}
          <link
            rel="preload"
            href="/darianrosebrook-optimized.webp"
            as="image"
            type="image/webp"
          />
          <link
            rel="preload"
            href="/darian-square.jpg"
            as="image"
            type="image/jpeg"
          />
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
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
                
                // Initialize performance monitoring
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', function() {
                    // Track page load performance
                    const loadTime = performance.now();
                    console.log('📊 Page Load Time:', loadTime.toFixed(2) + 'ms');
                    
                    // Track bundle size (approximate)
                    const scripts = document.querySelectorAll('script[src]');
                    let totalSize = 0;
                    scripts.forEach(script => {
                      const src = script.getAttribute('src');
                      if (src && src.includes('chunks')) {
                        totalSize += 100; // Approximate size per chunk
                      }
                    });
                    console.log('📦 Estimated Bundle Size:', totalSize + 'kB');
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ViewTransitions>
  );
}
