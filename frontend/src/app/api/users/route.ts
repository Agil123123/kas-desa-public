import { NextResponse } from 'next/server';
import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { userSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAuth('Admin');
    if (!auth.success) return auth.response;

    // ✅ FIX LOW-2: Explicitly select columns — exclude password hash and sessionToken
    const data = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.name);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const body = await request.json();

    // ✅ FIX CRITICAL-2: Validate user input
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const id = generateId('usr');
    
    let hashedPassword = '';
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }
    
    await db.insert(users).values({
      id,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    // ✅ FIX LOW-2: Return safe subset of user data
    const created = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id));

    return NextResponse.json(created[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
