import { NextResponse } from 'next/server';
import { db, transaksi } from '@kas/backend';
import { eq } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await db.select().from(transaksi).where(eq(transaksi.id, id));
  if (!data.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data[0]);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await db.update(transaksi).set({
      nominal: body.nominal,
      jenis: body.jenis,
      uraian: body.uraian,
      status: body.status,
    }).where(eq(transaksi.id, id));
    const updated = await db.select().from(transaksi).where(eq(transaksi.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(transaksi).where(eq(transaksi.id, id));
  return NextResponse.json({ success: true });
}

