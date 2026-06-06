import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

interface RouteParams {
  params: Promise<{ appId: string; entityId: string; recordId: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId, recordId } = await params;
    const body = await req.json();
    const { data } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ success: false, error: 'Valid record data is required' }, { status: 400 });
    }

    const updated = db.updateRecord(recordId, data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    db.addAuditLog('RECORD_UPDATE', `Updated record (${recordId}) in entity ${entityId}`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in PUT record:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId, recordId } = await params;
    const success = db.deleteRecord(recordId);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    db.addAuditLog('RECORD_DELETE', `Deleted record (${recordId}) from entity ${entityId}`);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    console.error('Error in DELETE record:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
