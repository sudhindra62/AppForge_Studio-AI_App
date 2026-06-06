export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    ERROR: '/error',
  },
  DASHBOARD: {
    HOME: '/dashboard',
  },
  APPS: {
    HOME: '/apps',
    NEW: '/apps/new',
    DETAIL: (id: string) => `/apps/${id}`,
  },
  API: {
    AUTH: '/api/auth',
    APPLICATIONS: '/api/applications',
  }
};
