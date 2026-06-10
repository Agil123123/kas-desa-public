import { NextResponse } from 'next/server';
import { db, rt } from '@kas/backend';

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
    const body = await request.json();
    const id = `rt-${Date.now()}`;
    await db.insert(rt).values({
      id,
      nomor: body.nomor,
      ketuaRt: body.ketuaRt || '',
      jumlahKk: body.jumlahKk || 0,
    });
    const created = await db.select().from(rt).where((await import('drizzle-orm')).eq(rt.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

