import { NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function GET() {
  try {
    const apps = db.getApplications();
    const entities = db.getEntities();
    const logs = db.getAuditLogs();

    // Sum up records across all designed entities
    let totalRecords = 0;
    entities.forEach(entity => {
      const recs = db.getRecords(entity.appId, entity.slug);
      totalRecords += recs.length;
    });

    return NextResponse.json({
      appsCount: apps.length,
      entitiesCount: entities.length,
      recordsCount: totalRecords,
      logsCount: logs.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/metrics:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
