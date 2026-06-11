import { NextResponse } from 'next/server';
import { db, kasKarangtaruna, transaksi } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth('Bendahara');
    if (!auth.success) return auth.response;

    const { id } = await params;
    
    // Get the record first to find the transaksiId
    const record = await db.select().from(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));
    
    if (record.length > 0) {
      const trxId = record[0].transaksiId;
      
      // Delete from kasKarangtaruna table
      await db.delete(kasKarangtaruna).where(eq(kasKarangtaruna.id, id));
      
      // Delete from transaksi table if linked
      if (trxId) {
        await db.delete(transaksi).where(eq(transaksi.id, trxId));
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
