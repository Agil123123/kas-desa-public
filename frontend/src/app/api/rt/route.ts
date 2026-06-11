import { NextResponse } from 'next/server';
import { db, rt } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';

export async function GET() {
  try {
    const data = await db.select().from(rt).orderBy(rt.nomor);
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
    const id = generateId('rt');
    await db.insert(rt).values({
      id,
      nomor: body.nomor,
      ketuaRt: body.ketuaRt || '',
      jumlahKk: body.jumlahKk || 0,
    });
    const created = await db.select().from(rt).where(eq(rt.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
