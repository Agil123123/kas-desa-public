import { NextResponse } from 'next/server';
import { db, transaksi, warga, kasKarangtaruna } from '@kas/backend';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // ── Total Warga ──────────────────────────────────────
    const [{ count: totalWarga }] = await db.select({
      count: sql<number>`count(*)`
    }).from(warga);

    // ── Jimpitan Stats (SQL Aggregation — no full-table scan) ──
    const [jimpitanAgg] = await db.select({
      totalMasuk: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' THEN nominal ELSE 0 END), 0)`,
      totalKeluar: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' THEN nominal ELSE 0 END), 0)`,
      masukHariIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' AND tanggal >= date('now','localtime') THEN nominal ELSE 0 END), 0)`,
      keluarHariIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' AND tanggal >= date('now','localtime') THEN nominal ELSE 0 END), 0)`,
      masukMingguIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' AND tanggal >= date('now','weekday 1','-7 days','localtime') THEN nominal ELSE 0 END), 0)`,
      keluarMingguIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' AND tanggal >= date('now','weekday 1','-7 days','localtime') THEN nominal ELSE 0 END), 0)`,
      masukBulanIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' AND tanggal >= date('now','start of month','localtime') THEN nominal ELSE 0 END), 0)`,
      keluarBulanIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' AND tanggal >= date('now','start of month','localtime') THEN nominal ELSE 0 END), 0)`,
      masukTahunIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' AND tanggal >= date('now','start of year','localtime') THEN nominal ELSE 0 END), 0)`,
      keluarTahunIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' AND tanggal >= date('now','start of year','localtime') THEN nominal ELSE 0 END), 0)`,
    })
    .from(transaksi)
    .where(sql`kategori = 'Kas Jimpitan'`);

    // ── Kas Karangtaruna Stats (SQL Aggregation) ──────────
    const [kasAgg] = await db.select({
      totalMasuk: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' THEN nominal ELSE 0 END), 0)`,
      totalKeluar: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' THEN nominal ELSE 0 END), 0)`,
      masukBulanIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Masuk' AND tanggal >= date('now','start of month','localtime') THEN nominal ELSE 0 END), 0)`,
      keluarBulanIni: sql<number>`COALESCE(SUM(CASE WHEN jenis='Keluar' AND tanggal >= date('now','start of month','localtime') THEN nominal ELSE 0 END), 0)`,
    })
    .from(kasKarangtaruna);

    // ── Jimpitan per RT ──────────────────────────────────
    const jimpitanPerRt = await db.select({
      rt: warga.rt,
      total: sql<number>`COALESCE(SUM(${transaksi.nominal}), 0)`,
    })
    .from(transaksi)
    .innerJoin(warga, eq(transaksi.wargaId, warga.id))
    .where(sql`kategori = 'Kas Jimpitan' AND jenis = 'Masuk'`)
    .groupBy(warga.rt);

    // ── Warga per RT ─────────────────────────────────────
    const wargaPerRt = await db.select({
      rt: warga.rt,
      count: sql<number>`count(*)`,
    })
    .from(warga)
    .groupBy(warga.rt);

    // ── Target Jimpitan ──────────────────────────────────
    const { pengaturan } = await import('@kas/backend');
    const settings = await db.select().from(pengaturan).limit(1);
    const targetPerKk = settings.length > 0 ? settings[0].targetJimpitan : 30000;

    // ── Build response (backward compatible) ─────────────
    const jimpitanMasuk = {
      today: jimpitanAgg.masukHariIni,
      week: jimpitanAgg.masukMingguIni,
      month: jimpitanAgg.masukBulanIni,
      year: jimpitanAgg.masukTahunIni,
      total: jimpitanAgg.totalMasuk,
    };
    const jimpitanKeluar = {
      today: jimpitanAgg.keluarHariIni,
      week: jimpitanAgg.keluarMingguIni,
      month: jimpitanAgg.keluarBulanIni,
      year: jimpitanAgg.keluarTahunIni,
      total: jimpitanAgg.totalKeluar,
    };
    const jimpitanStats = {
      today: jimpitanMasuk.today,
      week: jimpitanMasuk.week,
      month: jimpitanMasuk.month,
      year: jimpitanMasuk.year,
      total: jimpitanMasuk.total - jimpitanKeluar.total,
    };

    const kasMasukStats = {
      today: 0, week: 0,
      month: kasAgg.masukBulanIni,
      year: 0,
      total: kasAgg.totalMasuk,
    };
    const kasKeluarStats = {
      today: 0, week: 0,
      month: kasAgg.keluarBulanIni,
      year: 0,
      total: kasAgg.totalKeluar,
    };

    return NextResponse.json({
      totalWarga,
      jimpitanStats,
      jimpitanMasukStats: jimpitanMasuk,
      jimpitanKeluarStats: jimpitanKeluar,
      kasMasukStats,
      kasKeluarStats,
      saldoKasKarangtaruna: kasAgg.totalMasuk - kasAgg.totalKeluar,
      totalJimpitanKeseluruhan: jimpitanAgg.totalMasuk - jimpitanAgg.totalKeluar,
      jimpitanPerRt,
      wargaPerRt,
      targetPerKk,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
