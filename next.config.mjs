import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enable optimizations
    removeConsole: process.env.NODE_ENV === 'production',
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
      'gsap',
      '@gsap/react',
    ],
    // Enable View Transitions API support for page transitions
    viewTransition: true,
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
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
