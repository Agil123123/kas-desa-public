import { NextResponse } from 'next/server';
import { db, rt } from '@kas/backend';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await db.update(rt).set({
      nomor: body.nomor,
      ketuaRt: body.ketuaRt,
      jumlahKk: body.jumlahKk,
    }).where(eq(rt.id, id));
    const updated = await db.select().from(rt).where(eq(rt.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(rt).where(eq(rt.id, id));
  return NextResponse.json({ success: true });
}

