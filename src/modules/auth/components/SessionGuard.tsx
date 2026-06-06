import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { UserRole } from '@/modules/auth/types/auth.types';

export const getSession = async () => {
  const sessionCookie = (await cookies()).get('session');
  if (sessionCookie && sessionCookie.value) {
    return {
      user: {
        id: sessionCookie.value,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN' as UserRole,
      }
    };
  }
  return null;
};

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session?.user) {
    redirect('/dashboard');
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/');
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return session;
}
