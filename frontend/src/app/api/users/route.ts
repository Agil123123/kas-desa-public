import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';

export async function GET() {
  try {
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    const data = await db.select().from(users).orderBy(users.name);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const body = await request.json();
    const id = generateId('usr');
    
    let hashedPassword = '';
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(body.password, salt);
    }
    
    await db.insert(users).values({
      id,
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });
    const created = await db.select().from(users).where(eq(users.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
