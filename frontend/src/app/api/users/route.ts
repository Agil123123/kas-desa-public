import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const data = await db.select().from(users).orderBy(users.name);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `usr-${Date.now()}`;
    
    // Hash password if provided
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

