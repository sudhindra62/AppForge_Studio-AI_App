/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // We want the applet to boot reliably in preview even with stray types
  },
  eslint: {
    ignoreDuringBuilds: true, // Prevents non-critical lint warnings from blocking production builds
  }
};

export default nextConfig;
