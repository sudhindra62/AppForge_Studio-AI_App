import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function POST(req: NextRequest) {
  try {
    db.reset();
    db.addAuditLog('SYSTEM_RESET', 'Platform database successfully wiped and re-seeded with default operational blueprints.');
    return NextResponse.json({ success: true, message: 'Database successfully re-seeded.' });
  } catch (error: any) {
    console.error('Error in POST /api/database/reset:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
