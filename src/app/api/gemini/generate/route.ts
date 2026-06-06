import { NextRequest, NextResponse } from 'next/server';
import { generateAppSchema } from '@/lib/gemini';
import { db } from '@/database/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A valid text prompt is required' }, { status: 400 });
    }

    const spec = await generateAppSchema(prompt);
    
    // Log this intelligence service execution
    db.addAuditLog('GEMINI_API_CALL', `Generated metadata blueprint for: "${prompt.slice(0, 50)}..."`);

    return NextResponse.json(spec);
  } catch (error: any) {
    console.error('Error in route /api/gemini/generate:', error);
    return NextResponse.json({ error: error?.message || 'Server error during generation' }, { status: 500 });
  }
}
