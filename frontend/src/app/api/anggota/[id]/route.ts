import { NextResponse } from 'next/server';
import { db, anggota } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await req.json();
    await db.update(anggota).set({
      nama: body.nama,
      jabatan: body.jabatan,
      rt: body.rt,
    }).where(eq(anggota.id, id));
    const updated = await db.select().from(anggota).where(eq(anggota.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    const { id } = await params;
    await db.delete(anggota).where(eq(anggota.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
