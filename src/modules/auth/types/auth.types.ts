export type UserRole = 'USER' | 'ADMIN';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
};
