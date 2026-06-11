import { NextResponse } from 'next/server';
import { db, notifications, users } from '@kas/backend';
import { desc, eq, or } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { generateId } from '@/lib/id';

export const dynamic = 'force-dynamic';

async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return null;
  
  const existing = await db.select().from(users).where(eq(users.sessionToken, sessionToken));
  if (existing.length === 0) return null;
  
  return existing[0];
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.role;

    // --- System Auto-Summary (Feature 3) ---
    // Triggered randomly when Bendahara or Super Admin checks notifications
    if (['Bendahara', 'Super Admin'].includes(userRole)) {
      const today = new Date();
      // If it's the 28th or later of the month
      if (today.getDate() >= 28) {
        const monthYear = `${today.getMonth() + 1}-${today.getFullYear()}`;
        // Check if summary already exists for this month
        const existingSummary = await db.select().from(notifications)
          .where(eq(notifications.type, 'system'))
          .orderBy(desc(notifications.createdAt))
          .limit(10);
        
        const hasSummary = existingSummary.some(n => n.title.includes(`Rekap Kas Bulan ${monthYear}`));
        if (!hasSummary) {
          await db.insert(notifications).values({
            // ✅ FIX MEDIUM-2: Use generateId() instead of Date.now()
            id: generateId('notif'),
            title: `Rekap Kas Bulan ${monthYear} Telah Selesai`,
            message: `Bulan hampir berakhir. Mohon periksa buku besar Kas Karangtaruna dan Kas Jimpitan untuk memastikan seluruh transaksi sudah klop.`,
            type: 'system',
            targetRole: 'Bendahara',
            senderId: null,
          });
        }
      }
    }

    // Fetch notifications where targetRole matches user's role, or 'Semua'
    const data = await db
      .select()
      .from(notifications)
      .where(or(eq(notifications.targetRole, userRole), eq(notifications.targetRole, 'Semua')))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Admin, Super Admin, Bendahara can send manual notifications
    if (!['Super Admin', 'Admin', 'Bendahara'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    // ✅ FIX MEDIUM-2: Use generateId() instead of Date.now()
    const id = generateId('notif');
    
    await db.insert(notifications).values({
      id,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      targetRole: body.targetRole || 'Semua',
      senderId: user.id,
      isRead: false,
    });

    const created = await db.select().from(notifications).where(eq(notifications.id, id));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
