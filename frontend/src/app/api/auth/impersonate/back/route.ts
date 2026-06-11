import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Restore the Super Admin's original session after impersonation.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const originalSession = cookieStore.get('original_admin_session')?.value;

    if (!originalSession) {
      return NextResponse.json(
        { error: 'Tidak ada sesi admin yang tersimpan untuk dikembalikan.' },
        { status: 400 }
      );
    }

    // Verify original session is still a valid Super Admin
    const admin = await db.select().from(users).where(eq(users.sessionToken, originalSession));
    if (admin.length === 0 || admin[0].role !== 'Super Admin') {
      return NextResponse.json(
        { error: 'Sesi admin asli sudah tidak valid. Silakan login ulang.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ message: 'Berhasil kembali ke akun admin.' });

    // Restore admin session
    response.cookies.set('session_token', originalSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Remove the impersonation cookie
    response.cookies.delete('original_admin_session');

    return response;
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
