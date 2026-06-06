import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';

interface RouteParams {
  params: Promise<{ appId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params;
    const app = db.getApplicationById(appId);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json(app);
  } catch (error: any) {
    console.error('Error in GET /api/applications/[appId]:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params;
    const app = db.getApplicationById(appId);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    db.deleteApplication(appId);
    db.addAuditLog('APPLICATION_DELETE', `Destroyed application profile and schema contexts for: '${app.name}'`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/applications/[appId]:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
