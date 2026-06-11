import { NextResponse } from 'next/server';
import { db, transaksi, kasKarangtaruna, auditLog } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

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

    // Delete related kas entry first
    await db.delete(kasKarangtaruna).where(eq(kasKarangtaruna.transaksiId, id));

    if (trx.kategori === 'Kas Karangtaruna') {
      const { and, isNull } = await import('drizzle-orm');
      await db.delete(kasKarangtaruna).where(
        and(
          isNull(kasKarangtaruna.transaksiId),
          eq(kasKarangtaruna.nominal, trx.nominal),
          eq(kasKarangtaruna.uraian, trx.uraian || '')
        )
      );
    }

    // Delete the transaction
    await db.delete(transaksi).where(eq(transaksi.id, id));

    // Write audit log
    try {
      await db.insert(auditLog).values({
        id: `log-${Date.now()}`,
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
