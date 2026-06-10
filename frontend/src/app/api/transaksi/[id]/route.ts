import { NextResponse } from 'next/server';
import { db, transaksi, kasKarangtaruna, users, auditLog } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await db.select().from(transaksi).where(eq(transaksi.id, id));
  if (!data.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data[0]);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const { id } = await params;

    // Verify Super Admin
    const sessionToken = (await cookies()).get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUser = await db.select().from(users).where(eq(users.sessionToken, sessionToken));
    if (!currentUser.length || currentUser[0].role !== 'Super Admin') {
      return NextResponse.json({ error: 'Hanya Super Admin yang dapat menghapus transaksi' }, { status: 403 });
    }

    // Get transaction details before deletion (for audit log)
    const trxData = await db.select().from(transaksi).where(eq(transaksi.id, id));
    if (!trxData.length) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }
    const trx = trxData[0];

    // Delete related kas entry first
    await db.delete(kasKarangtaruna).where(eq(kasKarangtaruna.transaksiId, id));

    // Delete the transaction
    await db.delete(transaksi).where(eq(transaksi.id, id));

    // Write audit log
    try {
      await db.insert(auditLog).values({
        id: `log-${Date.now()}`,
        userId: currentUser[0].id,
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
