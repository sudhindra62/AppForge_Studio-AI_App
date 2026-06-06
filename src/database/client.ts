/**
 * client.ts — Mock Prisma Client Singleton (Preview Environment)
 */

const createMockPrisma = () => {
  console.warn('[AI Studio] Active direct database connection is disabled or offline. Activating in-memory DB fallback.');
  const dbStore = new Map<string, Map<string, any>>();

  const getCollection = (model: string) => {
    if (!dbStore.has(model)) {
      dbStore.set(model, new Map());
    }
    return dbStore.get(model)!;
  };

  const makeQueryEngine = (model: string) => {
    return {
      findMany: async (args: any = {}) => {
        const col = getCollection(model);
        let list = Array.from(col.values());
        
        if (args.where) {
          list = list.filter(item => {
            for (const [key, val] of Object.entries(args.where)) {
              if (val && typeof val === 'object' && 'equals' in val) {
                if (item[key] !== (val as any).equals) return false;
              } else if (item[key] !== val) {
                return false;
              }
            }
            return true;
          });
        }
        return list;
      },
      findFirst: async (args: any = {}) => {
        const col = getCollection(model);
        let list = Array.from(col.values());
        if (args.where) {
          list = list.filter(item => {
            for (const [key, val] of Object.entries(args.where)) {
              if (val && typeof val === 'object' && 'equals' in val) {
                if (item[key] !== (val as any).equals) return false;
              } else if (item[key] !== val) {
                return false;
              }
            }
            return true;
          });
        }
        return list[0] || null;
      },
      findUnique: async (args: any = {}) => {
        const col = getCollection(model);
        if (args.where && args.where.id) {
          return col.get(String(args.where.id)) || null;
        }
        let list = Array.from(col.values());
        if (args.where) {
          list = list.filter(item => {
            for (const [key, val] of Object.entries(args.where)) {
              if (item[key] !== val) return false;
            }
            return true;
          });
        }
        return list[0] || null;
      },
      create: async (args: any = {}) => {
        const col = getCollection(model);
        const data = args.data || {};
        const id = data.id || String(Math.random().toString(36).substr(2, 9));
        const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        col.set(id, record);
        return record;
      },
      update: async (args: any = {}) => {
        const col = getCollection(model);
        const id = args.where?.id ? String(args.where.id) : null;
        if (!id) throw new Error('Missing where.id for update');
        const record = col.get(id);
        const updated = { ...record, ...args.data, updatedAt: new Date() };
        col.set(id, updated);
        return updated;
      },
      delete: async (args: any = {}) => {
        const col = getCollection(model);
        const id = args.where?.id ? String(args.where.id) : null;
        if (id) col.delete(id);
        return {};
      },
      count: async (args: any = {}) => {
        const col = getCollection(model);
        return col.size;
      },
      deleteMany: async () => {
        getCollection(model).clear();
        return { count: 0 };
      },
      updateMany: async () => {
        return { count: 0 };
      },
    };
  };

  const mockClient = new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        if (prop === '$connect') return async () => {};
        if (prop === '$disconnect') return async () => {};
        if (prop === '$transaction') return async (fn: any) => typeof fn === 'function' ? fn(mockClient) : fn;
        return makeQueryEngine(prop);
      }
      return undefined;
    }
  });

  return mockClient;
};

export const prisma: any = createMockPrisma();
