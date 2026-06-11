const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const path = require('path');

async function seedAdmin() {
  const dbPath = path.join(__dirname, 'sqlite.db');
  const client = createClient({
    url: process.env.DATABASE_URL || `file:${dbPath}`,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const password = await bcrypt.hash('Aspirin*7', 10);
  const id = `usr-${Date.now()}`;

  await client.execute({
    sql: `INSERT INTO users (id, name, email, password, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))`,
    args: [id, 'Administrator', 'agil@nawasena.id', password, 'Super Admin', 1],
  });

  console.log('✅ Akun admin berhasil dibuat!');
  console.log('   Email: agil@nawasena.id');
  console.log('   Password: Aspirin*7');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('❌ Gagal:', err.message);
  process.exit(1);
});
