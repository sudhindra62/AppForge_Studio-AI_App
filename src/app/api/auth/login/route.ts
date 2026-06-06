import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (email === 'admin@example.com' && password === 'ForgeAppSecure99!') {
      (await cookies()).set('session', 'usr_admin', { path: '/', httpOnly: true });
      return NextResponse.json({ success: true, user: { id: 'usr_admin', email } });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
