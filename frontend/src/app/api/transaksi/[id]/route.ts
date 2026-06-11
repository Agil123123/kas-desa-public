import { NextResponse } from 'next/server';
import { db, transaksi, kasKarangtaruna, auditLog } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { transaksiUpdateSchema } from '@/lib/validation';
import { recalculateSaldoChain } from '@/lib/recalculate-saldo';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth('Petugas');
  if (!auth.success) return auth.response;

  const { id } = await params;
  const data = await db.select().from(transaksi).where(eq(transaksi.id, id));
  if (!data.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data[0]);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await req.json();

    // ✅ FIX CRITICAL-2: Validate update payload
    const parsed = transaksiUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    await db.update(transaksi).set({
      nominal: data.nominal,
      jenis: data.jenis,
      uraian: data.uraian,
      status: data.status,
    }).where(eq(transaksi.id, id));
    const updated = await db.select().from(transaksi).where(eq(transaksi.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Get transaction details before deletion (for audit log)
    const trxData = await db.select().from(transaksi).where(eq(transaksi.id, id));
    if (!trxData.length) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }
    const trx = trxData[0];

    // ✅ Atomic cascading delete
    await db.transaction(async (tx) => {
      // Delete related kas entry first
      await tx.delete(kasKarangtaruna).where(eq(kasKarangtaruna.transaksiId, id));

      if (trx.kategori === 'Kas Karangtaruna') {
        const { and, isNull } = await import('drizzle-orm');
        await tx.delete(kasKarangtaruna).where(
          and(
            isNull(kasKarangtaruna.transaksiId),
            eq(kasKarangtaruna.nominal, trx.nominal),
            eq(kasKarangtaruna.uraian, trx.uraian || '')
          )
        );
      }

      // Delete the transaction
      await tx.delete(transaksi).where(eq(transaksi.id, id));
    });

    // ✅ FIX MEDIUM-4: Recalculate saldo chain after deletion
    await recalculateSaldoChain();

    // Write audit log
    try {
      await db.insert(auditLog).values({
        // ✅ FIX MEDIUM-2: Use generateId() instead of Date.now()
        id: generateId('log'),
        userId: auth.user.id,
        aksi: 'DELETE',
        tabel: 'transaksi',
        keterangan: `Menghapus transaksi ${trx.noTransaksi} (Rp ${trx.nominal}) - ${trx.kategori}`,
      });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
