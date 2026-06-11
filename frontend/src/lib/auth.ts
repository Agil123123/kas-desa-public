import { db, users } from '@kas/backend';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ── Role Hierarchy ─────────────────────────────────────
// Angka lebih tinggi = akses lebih luas
const ROLE_HIERARCHY: Record<string, number> = {
  'Anggota': 0,
  'Petugas': 1,
  'Bendahara': 2,
  'Admin': 3,
  'Super Admin': 4,
};

type UserData = typeof users.$inferSelect;

type AuthSuccess = { success: true; user: UserData };
type AuthFailure = { success: false; response: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

/**
 * Authenticate dan authorize user dalam satu panggilan.
 * 
 * @param minRole - Role minimum yang diperlukan (default: 'Anggota')
 * @returns `{ success: true, user }` atau `{ success: false, response }`
 * 
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   const auth = await requireAuth('Bendahara');
 *   if (!auth.success) return auth.response;
 *   // auth.user.id, auth.user.role, auth.user.name tersedia
 * }
 * ```
 */
export async function requireAuth(minRole: string = 'Anggota'): Promise<AuthResult> {
  try {
    const sessionToken = (await cookies()).get('session_token')?.value;

    if (!sessionToken) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Silakan login terlebih dahulu' },
          { status: 401 }
        ),
      };
    }

    const result = await db.select().from(users)
      .where(eq(users.sessionToken, sessionToken));

    if (!result.length) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Sesi tidak valid. Silakan login ulang.' },
          { status: 401 }
        ),
      };
    }

    const user = result[0];

    if (!user.isActive) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Akun Anda sedang nonaktif atau menunggu persetujuan.' },
          { status: 403 }
        ),
      };
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return {
        success: false,
        response: NextResponse.json(
          { error: `Akses ditolak. Minimal role yang dibutuhkan: ${minRole}` },
          { status: 403 }
        ),
      };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth Error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Terjadi kesalahan autentikasi' },
        { status: 500 }
      ),
    };
  }
}
