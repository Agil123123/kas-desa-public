import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

import path from 'path';

const dbPath = path.join(process.cwd(), process.cwd().endsWith('backend') ? '' : '../backend', 'sqlite.db');

// Jika di-deploy (Vercel), maka akan menggunakan DATABASE_URL dari env (Turso). 
// Jika di lokal, gunakan file sqlite.db lokal.
const client = createClient({ 
  url: process.env.DATABASE_URL || `file:${dbPath}`,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
