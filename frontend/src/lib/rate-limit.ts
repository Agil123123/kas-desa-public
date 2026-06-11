import { db, loginAttempts } from '@kas/backend';
import { sql, eq, and, gt } from 'drizzle-orm';

/**
 * Database-backed rate limiter for login attempts.
 * 
 * Replaces the in-memory Map that gets wiped on every
 * Vercel serverless cold start.
 */
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  // Count recent attempts
  const [result] = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier),
        gt(loginAttempts.createdAt, windowStart)
      )
    );

  const count = result?.count || 0;

  if (count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - count };
}

/**
 * Record a failed login attempt.
 */
export async function recordLoginAttempt(identifier: string) {
  await db.insert(loginAttempts).values({
    identifier,
  });
}

/**
 * Clear attempts for an identifier (on successful login).
 */
export async function clearLoginAttempts(identifier: string) {
  await db.delete(loginAttempts)
    .where(eq(loginAttempts.identifier, identifier));
}

/**
 * Cleanup old entries (call periodically or after successful login).
 */
export async function cleanupOldAttempts() {
  try {
    await db.delete(loginAttempts)
      .where(
        sql`${loginAttempts.createdAt} < datetime('now', '-1 hour')`
      );
  } catch (e) {
    console.error('Failed to cleanup login attempts:', e);
  }
}
