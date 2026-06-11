import { NextResponse } from 'next/server';
import { db } from '@kas/backend/db';
import { warga, transaksi } from '@kas/backend/db/schema';
import { eq, and, like } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // "01" - "12"
    const year = searchParams.get('year'); // "2026"

    if (!month || !year) {
      return NextResponse.json({ error: 'Bulan dan Tahun harus diisi' }, { status: 400 });
    }

    const yearMonth = `${year}-${month.padStart(2, '0')}`;

    // Ambil data seluruh warga
    const allWarga = await db.select().from(warga);

    // Ambil semua transaksi Kas Jimpitan pada bulan yang dipilih
    const allTransaksi = await db.select()
      .from(transaksi)
      .where(
        and(
          eq(transaksi.kategori, 'Kas Jimpitan'),
          like(transaksi.tanggal, `${yearMonth}%`),
          eq(transaksi.status, 'Success')
        )
      );

    // Hitung jumlah hari dalam bulan tersebut untuk menentukan jumlah minggu
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const numberOfWeeks = Math.ceil(daysInMonth / 7);

    // Mengelompokkan transaksi berdasarkan wargaId
    const transaksiPerWarga: Record<string, any[]> = {};
    allTransaksi.forEach(trx => {
      if (!trx.wargaId || !trx.tanggal) return;
      if (!transaksiPerWarga[trx.wargaId]) {
        transaksiPerWarga[trx.wargaId] = [];
      }
      transaksiPerWarga[trx.wargaId].push(trx);
    });

    // Format laporan untuk setiap warga
    const laporanWarga = allWarga.map(w => {
      const trxWarga = transaksiPerWarga[w.id] || [];
      
      const riwayatMinggu = Array.from({ length: 5 }).map((_, i) => {
        const weekNum = i + 1;
        // Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29-31
        const startDay = (weekNum - 1) * 7 + 1;
        const endDay = weekNum * 7;

        // Cari transaksi di minggu ini
        let totalNominal = 0;
        let isPaid = false;

        trxWarga.forEach(trx => {
          const dateStr = trx.tanggal?.split('T')[0] || trx.tanggal;
          if (!dateStr) return;
          const day = parseInt(dateStr.split('-')[2], 10);
          
          if (day >= startDay && day <= endDay) {
            isPaid = true;
            totalNominal += trx.nominal;
          }
        });

        return {
          mingguKe: weekNum,
          status: isPaid ? 'Sudah' : 'Belum',
          nominal: totalNominal
        };
      });

      return {
        wargaId: w.id,
        nama: w.namaKk,
        rt: w.rt,
        rw: w.rw,
        minggu: riwayatMinggu
      };
    });

    // Urutkan berdasarkan RT lalu Nama
    laporanWarga.sort((a, b) => {
      if (a.rt !== b.rt) return a.rt.localeCompare(b.rt);
      return a.nama.localeCompare(b.nama);
    });

    return NextResponse.json({
      tahunBulan: yearMonth,
      jumlahMinggu: numberOfWeeks,
      data: laporanWarga
    });

  } catch (error) {
    console.error('Error fetching laporan mingguan warga:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}
