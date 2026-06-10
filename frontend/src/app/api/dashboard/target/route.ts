import { NextResponse } from 'next/server';
import { db, pengaturan, warga, transaksi } from '@kas/backend';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Get Target Per Warga
    const configData = await db.select().from(pengaturan).limit(1);
    const targetPerWarga = configData.length ? (configData[0].targetJimpitan || 30000) : 30000;

    // 2. Count Warga
    const countQuery = await db.select({ count: sql<number>`count(*)` }).from(warga);
    const totalWarga = countQuery[0].count;
    
    const globalTarget = targetPerWarga * totalWarga;

    // 3. Get Current Month Jimpitan
    const currentQuery = await db.select({
      total: sql<number>`COALESCE(SUM(${transaksi.nominal}), 0)`.mapWith(Number)
    }).from(transaksi)
      .where(sql`${transaksi.kategori} = 'Kas Jimpitan' AND ${transaksi.jenis} = 'Masuk' AND ${transaksi.tanggal} >= date('now', 'start of month', 'localtime')`);
    
    const current = currentQuery[0].total;

    return NextResponse.json({
      target: globalTarget,
      current: current
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
