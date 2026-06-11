import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { checkRateLimit, recordLoginAttempt, clearLoginAttempts, cleanupOldAttempts } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // ✅ FIX HIGH-2: Database-backed rate limiter (survives Vercel cold starts)
    const rateCheck = await checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan masuk, silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
    }

    // Find user
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      await recordLoginAttempt(ip);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = existing[0];

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Akun Anda sedang menunggu persetujuan Admin' }, { status: 403 });
    }

    // Verify password
    let isValid = false;
    if (user.password) {
      isValid = await bcrypt.compare(password, user.password);
    }

    if (!isValid) {
      await recordLoginAttempt(ip);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Clear failed attempts on success + cleanup old entries
    await clearLoginAttempts(ip);
    cleanupOldAttempts().catch(console.error); // fire-and-forget cleanup

    // Create session token securely
    const sessionToken = `sess_${Date.now()}_${crypto.randomBytes(32).toString('hex')}`;
    
    // Save to DB
    await db.update(users).set({ sessionToken }).where(eq(users.id, user.id));

    const response = NextResponse.json({ 
      message: 'Login berhasil', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });

    // Set cookie on the response
    const cookieOptions: any = {
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    };

    if (rememberMe) {
      cookieOptions.maxAge = 60 * 60 * 24 * 14; // 2 weeks
    }

    response.cookies.set(cookieOptions);

    return response;
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
