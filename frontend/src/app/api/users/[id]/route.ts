import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    let updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
      isActive: body.isActive,
    };
    
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }
    
    await db.update(users).set(updateData).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}

