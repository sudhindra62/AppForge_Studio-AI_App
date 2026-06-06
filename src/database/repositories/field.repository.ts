import { db } from '../db';

export const fieldRepository = {
  findAllForEntity: async (entityId: string) => {
    // Fields are inside the entity objects in our custom JSON db
    const entities = db.getEntities();
    const entity = entities.find(e => e.id === entityId);
    if (!entity || !entity.fields) return [];
    
    // Map them to match expected format
    return entity.fields.map((f, i) => ({
      id: `${entityId}_field_${i}`,
      name: f.name,
      label: f.name,
      type: f.type.toUpperCase(),
      isRequired: f.required,
      options: f.options,
    }));
  }
};
