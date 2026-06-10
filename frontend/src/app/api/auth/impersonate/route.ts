import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentSession = cookieStore.get('session_token')?.value;

    if (!currentSession) {
      return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 401 });
    }

    // Verify current user is super admin
    const currentUser = await db.select().from(users).where(eq(users.sessionToken, currentSession));
    if (currentUser.length === 0 || currentUser[0].role !== 'Super Admin') {
      return NextResponse.json({ error: 'Akses ditolak. Anda bukan Super Admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email target harus diisi' }, { status: 400 });
    }

    // Find target user
    const targetUser = await db.select().from(users).where(eq(users.email, email));
    if (targetUser.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const target = targetUser[0];

    // Create new session token for the target user (or use existing)
    const crypto = require('crypto');
    const sessionToken = `sess_${Date.now()}_${crypto.randomBytes(32).toString('hex')}`;
    
    // Save new session to target user
    await db.update(users).set({ sessionToken }).where(eq(users.id, target.id));

    // End superadmin session locally by setting the cookie to target user's session
    const response = NextResponse.json({ message: 'Login sebagai pengguna berhasil' });
    
    // Replace the session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
