/**
 * layout.tsx — Auth Route Group Layout
 *
 * Applies to: /login, /register, /forgot-password, /error
 * - Redirects authenticated users to dashboard
 * - Renders the premium split-screen auth UI
 */

import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/modules/auth/components/SessionGuard';

export const metadata: Metadata = {
  title: {
    template: '%s | AppForge AI',
    default: 'Sign In | AppForge AI',
  },
  description: 'Sign in or create your AppForge AI account to start building metadata-driven applications.',
  robots: { index: false, follow: false }, // Auth pages not indexed
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Redirect already-authenticated users to dashboard
  await redirectIfAuthenticated();

  return (
    <div className="auth-layout">
      {/* Left Panel — Branding (hidden on mobile) */}
      <aside className="auth-layout__branding" aria-hidden="true">
        <div className="auth-branding">
          <div className="auth-branding__logo">
            <span className="auth-branding__icon">⚡</span>
            <span className="auth-branding__name">AppForge AI</span>
          </div>
          <div className="auth-branding__headline">
            <h2 className="auth-branding__title">
              Build apps from<br />
              <span className="auth-branding__accent">metadata, not code</span>
            </h2>
            <p className="auth-branding__subtitle">
              Define your data model. AppForge AI generates the entire
              application — forms, tables, workflows, and APIs — automatically.
            </p>
          </div>
          <div className="auth-branding__features">
            {[
              { icon: '🚀', text: 'Deploy in seconds' },
              { icon: '🔒', text: 'Enterprise security' },
              { icon: '🌍', text: 'Multi-language support' },
              { icon: '📊', text: 'CSV import & export' },
            ].map(({ icon, text }) => (
              <div key={text} className="auth-branding__feature">
                <span className="auth-branding__feature-icon">{icon}</span>
                <span className="auth-branding__feature-text">{text}</span>
              </div>
            ))}
          </div>
          {/* Decorative animated orbs */}
          <div className="auth-branding__orb auth-branding__orb--1" />
          <div className="auth-branding__orb auth-branding__orb--2" />
          <div className="auth-branding__orb auth-branding__orb--3" />
        </div>
      </aside>

      {/* Right Panel — Auth Form */}
      <main className="auth-layout__form" role="main">
        <div className="auth-layout__form-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
