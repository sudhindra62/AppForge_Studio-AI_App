import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

interface RouteParams {
  params: Promise<{ appId: string; entityId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId } = await params;
    const body = await req.json();
    const { name, type, required, isRequired, options } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, error: 'Field name and type are required' }, { status: 400 });
    }

    let entities = db.getEntitiesByApp(appId);
    let entity = entities.find(e => e.id === entityId || e.slug.toLowerCase() === entityId.toLowerCase());
    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    // Check for column name duplicates
    const duplicate = entity.fields.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return NextResponse.json({ success: false, error: `Field '${name}' already exists in this entity` }, { status: 409 });
    }

    // Append new field schema
    const finalRequired = required !== undefined ? required : !!isRequired;
    const newField = { name, type, required: finalRequired, options };
    entity.fields.push(newField);
    db.save();

    db.addAuditLog('SCHEMA_ALTER', `Added field '${name}' (${type}) to entity ${entity.slug}`);

    return NextResponse.json({ success: true, data: entity });
  } catch (error: any) {
    console.error('Error in POST /api/applications/[appId]/entities/[entityId]/fields:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, entityId } = await params;
    const body = await req.json(); // complete replacement array of fields
    const { fields } = body;

    if (!Array.isArray(fields)) {
      return NextResponse.json({ success: false, error: 'An array of fields is required' }, { status: 400 });
    }

    let entities = db.getEntitiesByApp(appId);
    let entity = entities.find(e => e.id === entityId || e.slug.toLowerCase() === entityId.toLowerCase());
    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    entity.fields = fields;
    db.save();

    db.addAuditLog('SCHEMA_ALTER', `Re-configured fields schema for entity ${entity.slug}`);

    return NextResponse.json({ success: true, data: entity });
  } catch (error: any) {
    console.error('Error in PUT /api/applications/[appId]/entities/[entityId]/fields:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
