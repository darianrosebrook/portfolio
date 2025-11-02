import { Analytics } from '@vercel/analytics/react';
import localFont from 'next/font/local';
import { SVGSprites } from './SVGSprites/SVGSprites';
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
                // Only register service worker in production
                // In development (localhost), unregister any existing service workers
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    
                    if (isDevelopment) {
                      // Unregister all service workers in development
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for (let registration of registrations) {
                          registration.unregister().then(function(unregistered) {
                            console.log('🔄 Service Worker unregistered in development:', unregistered);
                          });
                        }
                        // Clear all caches
                        if ('caches' in window) {
                          caches.keys().then(function(cacheNames) {
                            return Promise.all(
                              cacheNames.map(function(cacheName) {
                                console.log('🗑️ Clearing cache:', cacheName);
                                return caches.delete(cacheName);
                              })
                            );
                          }).then(function() {
                            console.log('✅ All caches cleared for development');
                          });
                        }
                      });
                    } else {
                      // Register service worker in production
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered: ', registration);
                        })
                        .catch(function(registrationError) {
                          console.log('SW registration failed: ', registrationError);
                        });
                    }
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
  );
}
