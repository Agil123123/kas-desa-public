import { NextResponse } from 'next/server';
import { db, anggota } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';

export async function GET() {
  try {
    const data = await db.select().from(anggota).orderBy(anggota.nama);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    const body = await request.json();
    const id = generateId('agt');
    await db.insert(anggota).values({
      id,
      nama: body.nama,
      jabatan: body.jabatan,
      rt: body.rt || '',
    });
    const created = await db.select().from(anggota).where(eq(anggota.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
