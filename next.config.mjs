/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {},
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
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
};

export default nextConfig;
