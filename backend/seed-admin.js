const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const path = require('path');

async function seedAdmin() {
  // ✅ FIX MEDIUM-1: Password must come from environment variable, not hardcoded
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('❌ Error: Set ADMIN_PASSWORD environment variable first.');
    console.error('   Contoh: ADMIN_PASSWORD=YourSecurePassword node seed-admin.js');
    process.exit(1);
  }

  const dbPath = path.join(__dirname, 'sqlite.db');
  const client = createClient({
    url: process.env.DATABASE_URL || `file:${dbPath}`,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const password = await bcrypt.hash(adminPassword, 10);
  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  await client.execute({
    sql: `INSERT INTO users (id, name, email, password, role, is_active, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))
          ON CONFLICT (email) DO UPDATE SET password = excluded.password`,
    args: [id, 'Administrator', process.env.ADMIN_EMAIL || 'admin@sikarta.id', password, 'Super Admin', 1],
  });

  console.log('✅ Akun admin berhasil dibuat!');
  console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@sikarta.id');
  console.log('   Password: (dari environment variable ADMIN_PASSWORD)');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('❌ Gagal:', err.message);
  process.exit(1);
});
