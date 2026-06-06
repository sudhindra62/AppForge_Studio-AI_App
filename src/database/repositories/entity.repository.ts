import { db, Entity } from '../db';

export const entityRepository = {
  findBySlug: async (appId: string, slug: string) => {
    return db.getEntityBySlug(appId, slug);
  },
  
  findManyForApp: async (appId: string) => {
    return db.getEntitiesByApp(appId);
  }
};
