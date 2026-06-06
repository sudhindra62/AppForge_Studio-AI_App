import { db, AppRecord } from '../db';

export const recordRepository = {
  findMany: async (appId: string, entitySlug: string): Promise<AppRecord[]> => {
    return db.getRecords(appId, entitySlug);
  },

  create: async (appId: string, entitySlug: string, data: globalThis.Record<string, any>): Promise<AppRecord> => {
    const record = db.createRecord({
      appId,
      entitySlug,
      data,
    });
    db.addAuditLog('RECORD_CREATE', `Created record in ${entitySlug} with ID: ${record.id}`);
    return record as AppRecord;
  },

  update: async (id: string, data: globalThis.Record<string, any>): Promise<AppRecord | null> => {
    const record = db.updateRecord(id, data);
    if (record) {
      db.addAuditLog('RECORD_UPDATE', `Updated record in ${record.entitySlug} with ID: ${id}`);
    }
    return record as AppRecord | null;
  },

  delete: async (id: string): Promise<boolean> => {
    const success = db.deleteRecord(id);
    if (success) {
      db.addAuditLog('RECORD_DELETE', `Deleted record with ID: ${id}`);
    }
    return success;
  }
};
