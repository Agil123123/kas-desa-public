import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 401 });
    }

    const existing = await db.select().from(users).where(eq(users.sessionToken, sessionToken));
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

    const user = existing[0];
    const body = await request.json();
    const { name, oldPassword, newPassword } = body;

    const updates: any = {};

    // Update name if provided and different
    if (name && name !== user.name) {
      updates.name = name;
    }

    // Update password if requested
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ error: 'Kata sandi lama harus diisi untuk mengubah sandi' }, { status: 400 });
      }

      // Verify old password
      let isOldValid = false;
      if (user.password) {
        isOldValid = await bcrypt.compare(oldPassword, user.password);
      } else if (oldPassword === 'admin123') {
        isOldValid = true;
      }

      if (!isOldValid) {
        return NextResponse.json({ error: 'Kata sandi lama salah' }, { status: 400 });
      }

      // Hash new password
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, user.id));
    }

    return NextResponse.json({ message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
