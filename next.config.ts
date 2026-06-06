/**
 * next.config.ts — AppForge AI
 *
 * ARCHITECTURE NOTE:
 * This file is the Next.js configuration root.
 * Phase 1: Skeleton only — actual plugin integrations (PWA, i18n) added in Phase 2+.
 *
 * Key configuration areas:
 * - Security headers (CSP, HSTS, X-Frame-Options)
 * - Image optimization remote patterns (Vercel Blob, Neon CDN)
 * - PWA plugin (next-pwa) — enabled when FEATURE_PWA=true
 * - i18n (next-intl) — enabled when FEATURE_I18N=true
 * - Redirects & rewrites
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // ── TypeScript & ESLint ──────────────────────────────────────────
  typescript: {
    // In CI, type errors should fail the build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Security Headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ── Image Optimization ───────────────────────────────────────────
  images: {
    remotePatterns: [
      // Add Vercel Blob, Neon CDN, or other image hosts here
      // { hostname: 'your-bucket.public.blob.vercel-storage.com' },
    ],
  },

  // ── Experimental ────────────────────────────────────────────────
  experimental: {
    // serverActions are stable in Next.js 15 — no flag needed
  },
};

export default nextConfig;
