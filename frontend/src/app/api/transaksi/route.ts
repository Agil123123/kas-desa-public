import { NextResponse } from 'next/server';
import { db, transaksi, warga, users } from '@kas/backend';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth('Petugas');
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');

    const data = await db.select({
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

    const filtered = kategori ? data.filter(d => d.kategori === kategori) : data;
    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('Petugas');
    if (!auth.success) return auth.response;

    const body = await request.json();
    const id = generateId('trx');
    const noTransaksi = `${body.kategori === 'Kas Jimpitan' ? 'JMP' : 'KAS'}-${Date.now().toString(36).toUpperCase()}`;
    
    // petugasId diambil dari session, bukan dari body (lebih aman)
    const petugasId = auth.user.id;
    
    await db.insert(transaksi).values({
      id,
      noTransaksi,
      wargaId: body.wargaId || null,
      petugasId,
      tanggal: body.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
      nominal: body.nominal,
      kategori: body.kategori || 'Kas Jimpitan',
      jenis: body.jenis || 'Masuk',
      uraian: body.uraian || '',
      status: 'Success',
    });

    if ((body.kategori || 'Kas Jimpitan') === 'Kas Karangtaruna') {
      const { kasKarangtaruna } = await import('@kas/backend');
      const lastEntry = await db.select().from(kasKarangtaruna).orderBy(desc(kasKarangtaruna.createdAt)).limit(1);
      const lastSaldo = lastEntry.length > 0 ? lastEntry[0].saldoAkhir : 0;
      const newSaldo = (body.jenis || 'Masuk') === 'Masuk' ? lastSaldo + parseInt(body.nominal) : lastSaldo - parseInt(body.nominal);

      await db.insert(kasKarangtaruna).values({
        id: generateId('kr'),
        transaksiId: id,
        jenis: body.jenis || 'Masuk',
        nominal: parseInt(body.nominal),
        saldoAkhir: newSaldo,
        uraian: body.uraian || '',
        tanggal: body.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    // --- System Notification Trigger ---
    try {
      const { notifications } = await import('@kas/backend');
      
      const recentNotif = await db.select().from(notifications)
        .where(eq(notifications.senderId, petugasId))
        .orderBy(desc(notifications.createdAt))
        .limit(1);

      let shouldInsert = true;
      if (recentNotif.length > 0 && recentNotif[0].type === 'transaction') {
        const notifDate = new Date(recentNotif[0].createdAt + 'Z').getTime();
        if (Date.now() - notifDate < 15 * 60 * 1000) {
          shouldInsert = false;
        }
      }

      if (shouldInsert) {
        await db.insert(notifications).values({
          id: generateId('notif'),
          title: 'Setoran Transaksi Baru',
          message: `${auth.user.name} baru saja mulai menginput transaksi ${body.kategori}.`,
          type: 'transaction',
          targetRole: 'Bendahara',
          senderId: petugasId,
        });
      }
    } catch (e) {
      console.error('Failed to create notification:', e);
    }

    const created = await db.select().from(transaksi).where(eq(transaksi.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
