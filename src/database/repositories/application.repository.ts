import { db, Application } from '../db';
import { entityRepository } from './entity.repository';

export const applicationRepository = {
  findManyForUser: async (userId: string) => {
    // We are mocking this to just return all apps because our in-memory DB is small
    const apps = db.getApplications();
    const appsWithDetails = apps.map(app => {
      const entities = db.getEntitiesByApp(app.id);
      return {
        ...app,
        coverColor: '#1e293b', // default cover color
        version: 1,
        _count: { entities: entities.length }
      };
    });
    return { data: appsWithDetails };
  },

  findByIdForUser: async (appId: string, userId: string) => {
    const app = db.getApplicationById(appId);
    if (!app) return null;
    return app;
  }
};
