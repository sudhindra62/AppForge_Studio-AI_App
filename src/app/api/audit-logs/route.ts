import { NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function GET() {
  try {
    const logs = db.getAuditLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Error in GET /api/audit-logs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
