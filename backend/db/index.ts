import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

import path from 'path';
const dbPath = path.join(process.cwd(), process.cwd().endsWith('backend') ? '' : '../backend', 'sqlite.db');
const client = createClient({ url: `file:${dbPath}` });
export const db = drizzle(client, { schema });
