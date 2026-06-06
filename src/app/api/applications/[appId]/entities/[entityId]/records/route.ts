import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

interface RouteParams {
  params: Promise<{ appId: string; entityId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId } = await params;
    
    // Check if entityId matches by standard entity ID or by slug
    let entity = db.getEntitiesByApp(appId).find(e => e.id === entityId || e.slug.toLowerCase() === entityId.toLowerCase());
    if (!entity) {
      return NextResponse.json({ error: 'Entity table context not found' }, { status: 404 });
    }

    const records = db.getRecords(appId, entity.slug);
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error in GET /api/applications/[appId]/entities/[entityId]/records:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId } = await params;
    const body = await req.json();
    const { data } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ success: false, error: 'Valid record data item is required' }, { status: 400 });
    }

    let entity = db.getEntitiesByApp(appId).find(e => e.id === entityId || e.slug.toLowerCase() === entityId.toLowerCase());
    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity table context not found' }, { status: 404 });
    }

    // Dynamic field validation before insertion
    const errors: string[] = [];
    entity.fields.forEach(field => {
      const val = data[field.name];
      if (field.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${field.name}' is required.`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: errors }, { status: 422 });
    }

    const record = db.createRecord({
      appId,
      entitySlug: entity.slug,
      data,
    });

    db.addAuditLog('RECORD_CREATE', `Inserted new record (${record.id}) into ${entity.slug}`);

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/applications/[appId]/entities/[entityId]/records:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
