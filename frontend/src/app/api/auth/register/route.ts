import { NextResponse } from 'next/server';
import { db, users, pengaturan } from '@kas/backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/id';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password harus diisi' }, { status: 400 });
    }

    // Fetch allowed domains
    const config = await db.select().from(pengaturan).limit(1);
    const allowedDomainsStr = config.length > 0 && config[0].allowedDomains ? config[0].allowedDomains : 'gmail.com,nawapintar.com';
    const allowedDomains = allowedDomainsStr.split(',').map(d => d.trim().toLowerCase());
    
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      return NextResponse.json({ error: `Domain email tidak diizinkan. Gunakan domain berikut: ${allowedDomains.join(', ')}` }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // ✅ FIX MEDIUM-2: Use collision-safe generateId() instead of Date.now()
    const id = generateId('usr');

    // Create user (Pending approval)
    await db.insert(users).values({
      id,
      name,
      email,
      password: hashedPassword,
      role: 'Anggota',
      isActive: false, // Must be approved by admin
    });

    const created = await db.select().from(users).where(eq(users.id, id));
    return NextResponse.json({ message: 'Pendaftaran berhasil', user: { id: created[0].id, name: created[0].name, email: created[0].email } }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
