import { NextResponse } from 'next/server';
import { db, kasKarangtaruna, transaksi, users } from '@kas/backend';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { kasKarangtarunaSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAuth('Petugas');
    if (!auth.success) return auth.response;

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
    const auth = await requireAuth('Bendahara');
    if (!auth.success) return auth.response;

    const body = await request.json();

    // ✅ FIX CRITICAL-2: Validate input with Zod
    const parsed = kasKarangtarunaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const id = generateId('kr');

    // ✅ FIX CRITICAL-3: Atomic transaction — prevents saldo race condition
    await db.transaction(async (tx) => {
      // Read last saldo within transaction (serialized)
      const lastEntry = await tx.select().from(kasKarangtaruna)
        .orderBy(desc(kasKarangtaruna.createdAt)).limit(1);
      const lastSaldo = lastEntry.length > 0 ? lastEntry[0].saldoAkhir : 0;
      const newSaldo = data.jenis === 'Masuk'
        ? lastSaldo + data.nominal
        : lastSaldo - data.nominal;

      await tx.insert(kasKarangtaruna).values({
        id,
        transaksiId: data.transaksiId || null,
        jenis: data.jenis,
        nominal: data.nominal,
        saldoAkhir: newSaldo,
        uraian: data.uraian,
        tanggal: data.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    });

    const created = await db.select().from(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);

    // ✅ Handle SQLITE_BUSY gracefully
    if (error?.message?.includes('SQLITE_BUSY') || error?.code === 'SQLITE_BUSY') {
      return NextResponse.json(
        { error: 'Server sedang sibuk, silakan coba lagi dalam beberapa detik.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
