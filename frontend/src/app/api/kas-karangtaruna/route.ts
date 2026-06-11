import { NextResponse } from 'next/server';
import { db, kasKarangtaruna, transaksi, users } from '@kas/backend';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select({
      id: kasKarangtaruna.id,
      jenis: kasKarangtaruna.jenis,
      nominal: kasKarangtaruna.nominal,
      saldoAkhir: kasKarangtaruna.saldoAkhir,
      uraian: kasKarangtaruna.uraian,
      tanggal: kasKarangtaruna.tanggal,
      createdAt: kasKarangtaruna.createdAt,
      namaPetugas: users.name,
    })
    .from(kasKarangtaruna)
    .leftJoin(transaksi, eq(kasKarangtaruna.transaksiId, transaksi.id))
    .leftJoin(users, eq(transaksi.petugasId, users.id))
    .orderBy(desc(kasKarangtaruna.createdAt));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `kr-${Date.now()}`;

    // Get last saldo
    const lastEntry = await db.select().from(kasKarangtaruna).orderBy(desc(kasKarangtaruna.createdAt)).limit(1);
    const lastSaldo = lastEntry.length > 0 ? lastEntry[0].saldoAkhir : 0;
    const newSaldo = body.jenis === 'Masuk'
      ? lastSaldo + body.nominal
      : lastSaldo - body.nominal;

    await db.insert(kasKarangtaruna).values({
      id,
      transaksiId: body.transaksiId || null,
      jenis: body.jenis,
      nominal: body.nominal,
      saldoAkhir: newSaldo,
      uraian: body.uraian,
      tanggal: body.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
    });

    const created = await db.select().from(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
