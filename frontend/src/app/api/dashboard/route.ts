import { NextResponse } from 'next/server';
import { db, transaksi, warga, kasKarangtaruna } from '@kas/backend';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const totalWarga = await db.select({ count: sql<number>`count(*)` }).from(warga);
    
    // Fetch all transactions for Jimpitan
    const allJimpitan = await db.select().from(transaksi).where(sql`kategori = 'Kas Jimpitan' AND jenis = 'Masuk'`);
    // Fetch all Kas Karangtaruna
    const allKas = await db.select().from(kasKarangtaruna);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Get start of week (Monday)
    const dayOfWeek = now.getDay() || 7; 
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1).getTime();
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    // Helper to aggregate based on date
    const aggregate = (data: any[], dateField: string, amountField: string, jenisFilter?: string) => {
      let today = 0, week = 0, month = 0, year = 0, total = 0;
      data.forEach(item => {
        if (jenisFilter && item.jenis !== jenisFilter) return;
        const d = new Date(item[dateField]).getTime();
        const amt = Number(item[amountField]) || 0;
        total += amt;
        if (d >= startOfDay) today += amt;
        if (d >= startOfWeek) week += amt;
        if (d >= startOfMonth) month += amt;
        if (d >= startOfYear) year += amt;
      });
      return { today, week, month, year, total };
    };

    const jimpitanStats = aggregate(allJimpitan, 'tanggal', 'nominal');
    const kasMasukStats = aggregate(allKas, 'tanggal', 'nominal', 'Masuk');
    const kasKeluarStats = aggregate(allKas, 'tanggal', 'nominal', 'Keluar');

    // Total jimpitan per RT
    const jimpitanPerRt = await db.select({
      rt: warga.rt,
      total: sql<number>`COALESCE(SUM(${transaksi.nominal}), 0)`,
    })
    .from(transaksi)
    .innerJoin(warga, eq(transaksi.wargaId, warga.id))
    .where(sql`kategori = 'Kas Jimpitan' AND jenis = 'Masuk'`)
    .groupBy(warga.rt);

    // Count Warga per RT
    const wargaPerRt = await db.select({
      rt: warga.rt,
      count: sql<number>`count(*)`,
    })
    .from(warga)
    .groupBy(warga.rt);

    // Get Pengaturan for Target Jimpitan
    const { pengaturan } = await import('@kas/backend');
    const settings = await db.select().from(pengaturan).limit(1);
    const targetPerKk = settings.length > 0 ? settings[0].targetJimpitan : 30000;

    const lastKasEntry = allKas.sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime())[0];
    const saldoKas = lastKasEntry ? lastKasEntry.saldoAkhir : 0;

    return NextResponse.json({
      totalWarga: totalWarga[0].count,
      jimpitanStats,
      kasMasukStats,
      kasKeluarStats,
      saldoKasKarangtaruna: saldoKas,
      totalJimpitanKeseluruhan: jimpitanStats.total,
      jimpitanPerRt,
      wargaPerRt,
      targetPerKk,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

