import { NextResponse } from 'next/server';
import { db, warga, transaksi } from '@kas/backend';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select({
      id: warga.id,
      kodeUnik: warga.kodeUnik,
      nik: warga.nik,
      namaKk: warga.namaKk,
      rt: warga.rt,
      rw: warga.rw,
      createdAt: warga.createdAt,
      jimpitanBulanIni: sql<number>`COALESCE(SUM(CASE WHEN ${transaksi.tanggal} >= date('now', 'start of month', 'localtime') THEN ${transaksi.nominal} ELSE 0 END), 0)`.mapWith(Number),
      jimpitanMingguIni: sql<number>`COALESCE(SUM(CASE WHEN ${transaksi.tanggal} >= date('now', '-7 days', 'localtime') THEN ${transaksi.nominal} ELSE 0 END), 0)`.mapWith(Number)
    })
    .from(warga)
    .leftJoin(transaksi, sql`${warga.id} = ${transaksi.wargaId} AND ${transaksi.kategori} = 'Kas Jimpitan' AND ${transaksi.jenis} = 'Masuk'`)
    .groupBy(warga.id)
    .orderBy(warga.namaKk);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `wrg-${Date.now()}`;
    const kodeUnik = `QR-${Date.now().toString(36).toUpperCase()}`;
    const nik = body.nik || `NO-NIK-${Date.now()}`; // Fallback optional NIK
    await db.insert(warga).values({
      id,
      kodeUnik,
      nik,
      namaKk: body.namaKk,
      rt: body.rt,
      rw: body.rw || '04',
    });
    const created = await db.select().from(warga).where(eq(warga.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
