import { NextResponse } from 'next/server';
import { db, transaksi, kasKarangtaruna, auditLog, pengaturan, warga } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { transaksiUpdateSchema } from '@/lib/validation';
import { recalculateSaldoChain } from '@/lib/recalculate-saldo';
import { deleteFromSheet, updateInSheet } from '@/lib/google-sheets';

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

    // --- Google Sheets Sync Update ---
    try {
      const config = await db.select().from(pengaturan).limit(1);
      if (config.length > 0 && config[0].googleSheetId && updated.length > 0) {
        const trx = updated[0];
        let namaWargaUntukSheet = '-';
        if (trx.kategori === 'Kas Jimpitan' && trx.wargaId) {
          const w = await db.select().from(warga).where(eq(warga.id, trx.wargaId));
          if (w.length > 0) {
            namaWargaUntukSheet = w[0].namaKk;
          }
        }

        const rowData = [
          trx.noTransaksi,
          trx.tanggal,
          trx.kategori,
          trx.jenis,
          trx.nominal,
          trx.uraian,
          auth.user.name // Edited by
        ];

        if (trx.kategori === 'Kas Jimpitan') {
          rowData.push(namaWargaUntukSheet);
        }

        let computedSaldo = 0;
        if (trx.kategori === 'Kas Karangtaruna') {
          const kr = await db.select().from(kasKarangtaruna).where(eq(kasKarangtaruna.transaksiId, trx.id));
          if (kr.length > 0) {
            computedSaldo = kr[0].saldoAkhir;
          }
        } else if (trx.kategori === 'Kas Jimpitan') {
          const { sql } = await import('drizzle-orm');
          const res = await db.select({
            masuk: sql<number>`SUM(CASE WHEN jenis='Masuk' THEN nominal ELSE 0 END)`.mapWith(Number),
            keluar: sql<number>`SUM(CASE WHEN jenis='Keluar' THEN nominal ELSE 0 END)`.mapWith(Number)
          }).from(transaksi).where(eq(transaksi.kategori, 'Kas Jimpitan'));
          computedSaldo = (res[0]?.masuk || 0) - (res[0]?.keluar || 0);
        }

        rowData.push(computedSaldo);
        await updateInSheet(config[0].googleSheetId, trx.kategori === 'Kas Jimpitan' ? 'Kas Jimpitan' : 'Kas Karangtaruna', trx.noTransaksi, rowData);
      }
    } catch (e) {
      console.error('Failed to update Google Sheets:', e);
    }

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

    // --- Google Sheets Sync Delete ---
    try {
      const config = await db.select().from(pengaturan).limit(1);
      if (config.length > 0 && config[0].googleSheetId) {
        await deleteFromSheet(config[0].googleSheetId, trx.kategori === 'Kas Jimpitan' ? 'Kas Jimpitan' : 'Kas Karangtaruna', trx.noTransaksi);
      }
    } catch (e) {
      console.error('Failed to delete from Google Sheets:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
