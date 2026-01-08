import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enable optimizations
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Suppress webpack cache warnings for large strings (fonts, geometry data)
  // This warning is expected when caching large binary/text data and is acceptable
  onDemandEntries: {
    // Period in ms to keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wrgenoqnojvalkscpiib.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'video.bsky.app',
        port: '',
      },
    ],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-image',
      '@tiptap/extension-link',
      '@tiptap/html',
      // NOTE: gsap and @gsap/react removed - causes webpack module factory issues with dynamic imports
      // 'gsap',
      // '@gsap/react',
    ],
    // Enable View Transitions API support for page transitions
    viewTransition: true,
  },
  // Turbopack configuration (Next.js 16+)
  // Empty config to silence error - we're using webpack config for now
  turbopack: {},
  // Webpack optimizations
  webpack: (config, { dev, isServer, isEdge }) => {
    // Disable webpack cache in development if issues occur
    // Set DISABLE_WEBPACK_CACHE=true to force fresh builds
    if (dev && process.env.DISABLE_WEBPACK_CACHE === 'true') {
      config.cache = false;
    } else if (dev && config.cache) {
      // Optimize webpack cache for large strings (fonts, geometry data)
      // The warning about serializing big strings is expected when caching
      // large font files and geometry data - this is acceptable for dev performance
      config.cache = {
        ...config.cache,
        // Compress cache to reduce I/O overhead for large strings
        compression: config.cache.compression || 'gzip',
      };
    }

    // Mark fontkit as external for client bundles to avoid webpack resolution issues
    // We use dynamic import at runtime instead
    if (!isServer) {
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals)
          ? originalExternals
          : [originalExternals]),
        ({ request }, callback) => {
          // Mark fontkit as external for client - we'll use dynamic import
          if (request === 'fontkit') {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ].filter(Boolean);
    }

    // Handle Supabase in Edge Runtime
    if (isEdge) {
      config.resolve.alias = {
        ...config.resolve.alias,
        encoding: false,
      };
    }

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            tiptap: {
              test: /[\\/]node_modules[\\/](@tiptap)[\\/]/,
              name: 'tiptap',
              priority: 10,
            },
            gsap: {
              test: /[\\/]node_modules[\\/](gsap|@gsap)[\\/]/,
              name: 'gsap',
              priority: 10,
            },
            sandpack: {
              test: /[\\/]node_modules[\\/](@codesandbox\/sandpack)[\\/]/,
              name: 'sandpack',
              priority: 10,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },
  // Compression
  compress: true,
  // Power by header removal
  poweredByHeader: false,
  // Cache headers for production
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
