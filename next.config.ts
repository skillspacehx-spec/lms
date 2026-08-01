import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [100, 75],
  },
  // Enable TypeScript checking in production but with increased memory
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking
  },
  experimental: {
    // Increase memory for build processes
    workerThreads: false,
  },
};

export default nextConfig;
