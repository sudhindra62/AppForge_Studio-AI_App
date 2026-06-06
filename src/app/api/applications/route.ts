import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function GET() {
  try {
    const apps = db.getApplications();
    return NextResponse.json(apps);
  } catch (error: any) {
    console.error('Error in GET /api/applications:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Application name is required' }, { status: 400 });
    }

    const app = db.createApplication({
      name,
      description: description || '',
      icon: icon || 'Layers',
      status: status || 'draft',
    });

    db.addAuditLog('APPLICATION_CREATE', `Created empty application blueprint: '${name}'`);

    return NextResponse.json(app, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/applications:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
