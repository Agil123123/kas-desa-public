import { NextResponse } from 'next/server';
import { db, kasKarangtaruna, transaksi, auditLog, pengaturan } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { recalculateSaldoChain } from '@/lib/recalculate-saldo';
import { deleteFromSheet } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ✅ FIX HIGH-3: Require Super Admin (matches transaksi deletion policy)
    // Previously required only 'Bendahara', which was a RBAC bypass
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const { id } = await params;

    const record = await db.select().from(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));

    if (record.length === 0) {
      return NextResponse.json({ error: 'Entri tidak ditemukan' }, { status: 404 });
    }

    const trxId = record[0].transaksiId;

    let noTransaksi = '';
    if (trxId) {
      const trxData = await db.select().from(transaksi).where(eq(transaksi.id, trxId));
      if (trxData.length > 0) {
        noTransaksi = trxData[0].noTransaksi;
      }
    }

    // ✅ Atomic cascading delete
    await db.transaction(async (tx) => {
      // Delete from kasKarangtaruna table
      await tx.delete(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));

      // Delete from transaksi table if linked
      if (trxId) {
        await tx.delete(transaksi).where(eq(transaksi.id, trxId));
      }
    });

    // ✅ FIX MEDIUM-4: Recalculate the entire saldo chain after deletion
    await recalculateSaldoChain();

    // ✅ Add audit log (was missing entirely!)
    try {
      await db.insert(auditLog).values({
        id: generateId('log'),
        userId: auth.user.id,
        aksi: 'DELETE',
        tabel: 'kas_karangtaruna',
        keterangan: `Menghapus entri kas: ${record[0].uraian} (Rp ${record[0].nominal})`,
      });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    // --- Google Sheets Sync Delete ---
    if (noTransaksi) {
      try {
        const config = await db.select().from(pengaturan).limit(1);
        if (config.length > 0 && config[0].googleSheetId) {
          await deleteFromSheet(config[0].googleSheetId, 'Kas Karangtaruna', noTransaksi);
        }
      } catch (e) {
        console.error('Failed to delete from Google Sheets:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
