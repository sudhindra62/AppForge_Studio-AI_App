/**
 * register/page.tsx — Registration Page
 */

import type { Metadata } from 'next';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free AppForge AI account and start building metadata-driven applications.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
