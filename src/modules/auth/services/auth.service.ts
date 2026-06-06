import { prisma } from '@/database/client';
import bcrypt from 'bcryptjs';

export async function authenticateWithCredentials(email: string, passwordHashCandidate: string) {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user || !user.password) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(passwordHashCandidate, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user;
}

export async function handleOAuthSignIn(email: string, provider: string) {
  if (!email) return false;
  
  // Try to find the user
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    // Let NextAuth create the user, it will be handled by the createUser event
    return true;
  }

  // Ensure the user is active
  if (!user.isActive) {
    return false;
  }

  return true;
}
