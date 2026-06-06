/**
 * login/page.tsx — Sign In Page
 */

import type { Metadata } from 'next';
import { LoginForm } from '@/modules/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your AppForge AI account using email/password, Google, or GitHub.',
};

export default function LoginPage() {
  return <LoginForm />;
}
