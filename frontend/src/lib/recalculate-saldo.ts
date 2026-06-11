import { db, kasKarangtaruna } from '@kas/backend';
import { asc, eq } from 'drizzle-orm';

/**
 * Recalculate the entire saldoAkhir chain after a deletion.
 * 
 * This must be called after any DELETE on kas_karangtaruna
 * because saldoAkhir is a running balance — deleting a row
 * in the middle breaks all subsequent entries.
 */
export async function recalculateSaldoChain() {
  const allEntries = await db.select()
    .from(kasKarangtaruna)
    .orderBy(asc(kasKarangtaruna.tanggal), asc(kasKarangtaruna.createdAt));

  let runningBalance = 0;
  for (const entry of allEntries) {
    if (entry.jenis === 'Masuk') {
      runningBalance += entry.nominal;
    } else {
      runningBalance -= entry.nominal;
    }

    if (entry.saldoAkhir !== runningBalance) {
      await db.update(kasKarangtaruna)
        .set({ saldoAkhir: runningBalance })
        .where(eq(kasKarangtaruna.id, entry.id));
    }
  }
}
