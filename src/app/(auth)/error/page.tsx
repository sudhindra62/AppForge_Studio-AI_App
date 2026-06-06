/**
 * error/page.tsx — Auth Error Page
 * Handles NextAuth error codes passed as ?error= query param
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An authentication error occurred.',
};

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Your account may be suspended.',
  },
  Verification: {
    title: 'Link Expired',
    description: 'The sign-in link has expired or has already been used.',
  },
  AccountSuspended: {
    title: 'Account Suspended',
    description: 'Your account has been suspended. Contact support for assistance.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during sign in. Please try again.',
  },
};

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error = 'Default' } = await searchParams;
  const errorInfo = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="auth-card auth-card--error">
      <div className="auth-card__header">
        <div className="auth-error-icon">🔒</div>
        <h1 className="auth-card__title text-red-400">{errorInfo.title}</h1>
        <p className="auth-card__subtitle">{errorInfo.description}</p>
      </div>
      <div className="auth-error-actions">
        <Link href={ROUTES.AUTH.LOGIN} className="auth-submit-button text-center block">
          Try signing in again
        </Link>
        <Link href="/" className="auth-link-btn text-center block mt-3">
          Back to home
        </Link>
      </div>
    </div>
  );
}
