import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

interface RouteParams {
  params: Promise<{ appId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params;
    const entities = db.getEntitiesByApp(appId);
    return NextResponse.json({ success: true, data: entities });
  } catch (error: any) {
    console.error('Error in GET /api/applications/[appId]/entities:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params;
    const body = await req.json();
    const { name, slug, description, fields } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    // Verify application existence
    const app = db.getApplicationById(appId);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    // Check slug collision
    const existing = db.getEntityBySlug(appId, slug);
    if (existing) {
      return NextResponse.json({ success: false, error: `An entity with slug '${slug}' already exists under this application` }, { status: 409 });
    }

    const newEntity = db.createEntity({
      appId,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      description: description || '',
      fields: fields || [],
    });

    db.addAuditLog('ENTITY_CREATE', `Created entity '${name}' (${slug}) for application ID: ${appId}`);

    return NextResponse.json({ success: true, data: newEntity }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/applications/[appId]/entities:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
