import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Remove token from DB
      await db.update(users).set({ sessionToken: null }).where(eq(users.sessionToken, sessionToken));
    }

    const response = NextResponse.json({ message: 'Logout berhasil' });
    
    // Clear cookie
    response.cookies.delete('session_token');

    return response;
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
