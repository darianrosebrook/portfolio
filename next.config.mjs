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
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        
      }
    ],
  },
};

export default nextConfig;
