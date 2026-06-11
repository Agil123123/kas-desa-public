import { NextResponse } from 'next/server';
import { db, transaksi, warga, users, kasKarangtaruna, notifications, pengaturan } from '@kas/backend';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { transaksiSchema } from '@/lib/validation';
import { appendToSheet } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

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

    // ✅ FIX CRITICAL-2: Validate input with Zod (prevents negative nominals, invalid enums)
    const parsed = transaksiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const id = generateId('trx');
    const noTransaksi = `${data.kategori === 'Kas Jimpitan' ? 'JMP' : 'KAS'}-${Date.now().toString(36).toUpperCase()}`;
    
    // petugasId diambil dari session, bukan dari body (lebih aman)
    const petugasId = auth.user.id;

    // ✅ FIX CRITICAL-4: Atomic transaction — both transaksi + kasKarangtaruna in one tx
    await db.transaction(async (tx) => {
      await tx.insert(transaksi).values({
        id,
        noTransaksi,
        wargaId: data.wargaId || null,
        petugasId,
        tanggal: data.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
        nominal: data.nominal,
        kategori: data.kategori,
        jenis: data.jenis,
        uraian: data.uraian || '',
        status: 'Success',
      });

      if (data.kategori === 'Kas Karangtaruna') {
        const lastEntry = await tx.select().from(kasKarangtaruna)
          .orderBy(desc(kasKarangtaruna.createdAt)).limit(1);
        const lastSaldo = lastEntry.length > 0 ? lastEntry[0].saldoAkhir : 0;
        const newSaldo = data.jenis === 'Masuk'
          ? lastSaldo + data.nominal
          : lastSaldo - data.nominal;

        await tx.insert(kasKarangtaruna).values({
          id: generateId('kr'),
          transaksiId: id,
          jenis: data.jenis,
          nominal: data.nominal,
          saldoAkhir: newSaldo,
          uraian: data.uraian || '',
          tanggal: data.tanggal || new Date().toISOString().slice(0, 16).replace('T', ' '),
        });
      }
    });

    // --- System Notification Trigger (non-critical, outside transaction) ---
    try {
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
          message: `${auth.user.name} baru saja mulai menginput transaksi ${data.kategori}.`,
          type: 'transaction',
          targetRole: 'Bendahara',
          senderId: petugasId,
        });
      }
    } catch (e) {
      console.error('Failed to create notification:', e);
    }

    const created = await db.select().from(transaksi).where(eq(transaksi.id, id));

    // --- Google Sheets Sync (Fire and Forget) ---
    try {
      const config = await db.select().from(pengaturan).limit(1);
      if (config.length > 0 && config[0].googleSheetId) {
        const rowData = [
          created[0].noTransaksi,
          created[0].tanggal,
          data.kategori,
          data.jenis,
          data.nominal,
          data.uraian,
          auth.user.name
        ];
        // Await is required in Serverless environments like Vercel
        await appendToSheet(config[0].googleSheetId, data.kategori === 'Kas Jimpitan' ? 'Kas Jimpitan' : 'Kas Karangtaruna', rowData);
      }
    } catch (e) {
      console.error('Failed to sync to Google Sheets:', e);
    }
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);

    // ✅ Handle SQLITE_BUSY gracefully
    if (error?.message?.includes('SQLITE_BUSY') || error?.code === 'SQLITE_BUSY') {
      return NextResponse.json(
        { error: 'Server sedang sibuk, silakan coba lagi dalam beberapa detik.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
