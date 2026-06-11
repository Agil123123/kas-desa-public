import { NextResponse } from 'next/server';
import { db, pengaturan } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await db.select().from(pengaturan).limit(1);
    if (!data.length) {
      return NextResponse.json({
        id: 'cfg-1',
        namaOrganisasi: 'Karangtaruna Bhakti Karya',
        alamat: '',
        dusun: '',
        rw: '04',
        targetJimpitan: 30000,
        allowedDomains: 'gmail.com,nawapintar.com',
        googleSheetId: '',
      });
    }
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const body = await request.json();
    const existing = await db.select().from(pengaturan).limit(1);
    if (existing.length === 0) {
      await db.insert(pengaturan).values({
        id: 'cfg-1',
        namaOrganisasi: body.namaOrganisasi,
        alamat: body.alamat,
        dusun: body.dusun,
        rw: body.rw,
        targetJimpitan: body.targetJimpitan,
        allowedDomains: body.allowedDomains,
        googleSheetId: body.googleSheetId,
      });
    } else {
      await db.update(pengaturan).set({
        namaOrganisasi: body.namaOrganisasi,
        alamat: body.alamat,
        dusun: body.dusun,
        rw: body.rw,
        targetJimpitan: body.targetJimpitan,
        allowedDomains: body.allowedDomains,
        googleSheetId: body.googleSheetId,
      }).where(eq(pengaturan.id, existing[0].id));
    }
    const updated = await db.select().from(pengaturan).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
