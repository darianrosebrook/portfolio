/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wrgenoqnojvalkscpiib.supabase.co",
        port: "", 
      },
    ],
  },
};

export default nextConfig;
