import { NextResponse } from 'next/server';
import { db, transaksi, warga, users } from '@kas/backend';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');

    let query = db.select({
      id: transaksi.id,
      noTransaksi: transaksi.noTransaksi,
      wargaId: transaksi.wargaId,
      namaWarga: warga.namaKk,
      rtWarga: warga.rt,
      petugasId: transaksi.petugasId,
      namaPetugas: users.name,
      tanggal: transaksi.tanggal,
      nominal: transaksi.nominal,
      kategori: transaksi.kategori,
      jenis: transaksi.jenis,
      uraian: transaksi.uraian,
      status: transaksi.status,
      createdAt: transaksi.createdAt,
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(users, eq(transaksi.petugasId, users.id))
    .orderBy(desc(transaksi.tanggal));

    const data = await query;
    const filtered = kategori ? data.filter(d => d.kategori === kategori) : data;
    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `trx-${Date.now()}`;
    const noTransaksi = `${body.kategori === 'Kas Jimpitan' ? 'JMP' : 'KAS'}-${Date.now().toString(36).toUpperCase()}`;
    await db.insert(transaksi).values({
      id,
      noTransaksi,
      wargaId: body.wargaId || null,
      petugasId: body.petugasId || null,
      tanggal: body.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
      nominal: body.nominal,
      kategori: body.kategori || 'Kas Jimpitan',
      jenis: body.jenis || 'Masuk',
      uraian: body.uraian || '',
      status: 'Success',
    });

    if ((body.kategori || 'Kas Jimpitan') === 'Kas Karangtaruna') {
      const { kasKarangtaruna } = await import('@kas/backend');
      const { desc } = await import('drizzle-orm');
      const lastEntry = await db.select().from(kasKarangtaruna).orderBy(desc(kasKarangtaruna.createdAt)).limit(1);
      const lastSaldo = lastEntry.length > 0 ? lastEntry[0].saldoAkhir : 0;
      const newSaldo = (body.jenis || 'Masuk') === 'Masuk' ? lastSaldo + parseInt(body.nominal) : lastSaldo - parseInt(body.nominal);

      await db.insert(kasKarangtaruna).values({
        id: `kr-${Date.now()}`,
        transaksiId: id,
        jenis: body.jenis || 'Masuk',
        nominal: parseInt(body.nominal),
        saldoAkhir: newSaldo,
        uraian: body.uraian || '',
        tanggal: body.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    // --- System Notification Trigger ---
    if (body.petugasId) {
      const { notifications, users } = await import('@kas/backend');
      const { desc } = await import('drizzle-orm');
      
      // Fetch petugas details
      const petugasData = await db.select().from(users).where(eq(users.id, body.petugasId));
      const namaPetugas = petugasData.length > 0 ? petugasData[0].name : 'Petugas';
      
      // Check if there's a recent notification from this petugas to prevent spam
      const recentNotif = await db.select().from(notifications)
        .where(eq(notifications.senderId, body.petugasId))
        .orderBy(desc(notifications.createdAt))
        .limit(1);

      let shouldInsert = true;
      if (recentNotif.length > 0 && recentNotif[0].type === 'transaction') {
        const notifDate = new Date(recentNotif[0].createdAt + 'Z').getTime(); // append Z for correct UTC parsing if needed, but local time is stored.
        // If less than 15 minutes ago, don't spam
        if (Date.now() - notifDate < 15 * 60 * 1000) {
          shouldInsert = false;
        }
      }

      if (shouldInsert) {
        await db.insert(notifications).values({
          id: `notif-${Date.now()}`,
          title: 'Setoran Transaksi Baru',
          message: `${namaPetugas} baru saja mulai menginput transaksi ${body.kategori}.`,
          type: 'transaction',
          targetRole: 'Bendahara', // Also notify Admin if needed, or 'Semua'
          senderId: body.petugasId,
        });
      }
    }

    const created = await db.select().from(transaksi).where(eq(transaksi.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

