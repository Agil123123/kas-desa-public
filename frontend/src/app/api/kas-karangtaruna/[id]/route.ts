import { NextResponse } from 'next/server';
import { db, kasKarangtaruna } from '@kas/backend';
import { eq } from 'drizzle-orm';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));
  return NextResponse.json({ success: true });
}

