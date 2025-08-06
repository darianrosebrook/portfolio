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
    optimizePackageImports: ['@tiptap/react', '@tiptap/starter-kit'],
  },
  // Compression
  compress: true,
  // Power by header removal
  poweredByHeader: false,
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
