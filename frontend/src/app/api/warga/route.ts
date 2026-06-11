import { NextResponse } from 'next/server';
import { db, warga, transaksi, auditLog } from '@kas/backend';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';

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
      jimpitanMingguIni: sql<number>`COALESCE(SUM(CASE WHEN ${transaksi.tanggal} >= date('now', '-7 days', 'localtime') THEN ${transaksi.nominal} ELSE 0 END), 0)`.mapWith(Number),
      totalTransaksi: sql<number>`COUNT(${transaksi.id})`.mapWith(Number)
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
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    const body = await request.json();
    const id = generateId('wrg');
    const kodeUnik = `QR-${Date.now().toString(36).toUpperCase()}`;
    const nik = body.nik || `NO-NIK-${Date.now()}`;
    await db.insert(warga).values({
      id,
      kodeUnik,
      nik,
      namaKk: body.namaKk,
      rt: body.rt,
      rw: body.rw || '04',
    });

    // Audit log with user from session
    try {
      await db.insert(auditLog).values({
        id: generateId('log'),
        userId: auth.user.id,
        aksi: 'CREATE',
        tabel: 'warga',
        keterangan: `Menambahkan warga baru: ${body.namaKk} (RT ${body.rt})`
      });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    const created = await db.select().from(warga).where(eq(warga.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
