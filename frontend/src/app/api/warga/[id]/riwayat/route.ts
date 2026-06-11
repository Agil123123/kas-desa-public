import { NextRequest, NextResponse } from 'next/server';
import { db } from '@kas/backend/db';
import { transaksi, warga } from '@kas/backend/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID Warga tidak ditemukan' }, { status: 400 });
    }

    // Cek keberadaan warga
    const wargaResult = await db.select().from(warga).where(eq(warga.id, id)).limit(1);
    if (wargaResult.length === 0) {
      return NextResponse.json({ error: 'Data Warga tidak ditemukan' }, { status: 404 });
    }

    // Ambil riwayat transaksi
    const riwayat = await db.select()
      .from(transaksi)
      .where(
        and(
          eq(transaksi.wargaId, id),
          eq(transaksi.kategori, 'Kas Jimpitan')
        )
      )
      .orderBy(desc(transaksi.tanggal));

    return NextResponse.json({
      warga: wargaResult[0],
      riwayat: riwayat
    });

  } catch (error) {
    console.error('Error fetching riwayat warga:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}
