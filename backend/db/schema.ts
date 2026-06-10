import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Pengaturan (Org Settings) ──────────────────────────
export const pengaturan = sqliteTable('pengaturan', {
  id: text('id').primaryKey(),
  namaOrganisasi: text('nama_organisasi').notNull().default('Karangtaruna Bhakti Karya'),
  alamat: text('alamat').default(''),
  dusun: text('dusun').default(''),
  rw: text('rw').default('04'),
  targetJimpitan: integer('target_jimpitan').default(30000),
  allowedDomains: text('allowed_domains').default('gmail.com,nawapintar.com'),
});

// ── Master Data RT ─────────────────────────────────────
export const rt = sqliteTable('rt', {
  id: text('id').primaryKey(),
  nomor: text('nomor').unique().notNull(),
  ketuaRt: text('ketua_rt').default(''),
  jumlahKk: integer('jumlah_kk').default(0),
});

// ── Users ──────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').default(''),
  role: text('role').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sessionToken: text('session_token'),
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});

// ── Warga ──────────────────────────────────────────────
export const warga = sqliteTable('warga', {
  id: text('id').primaryKey(),
  kodeUnik: text('kode_unik').unique().notNull(),
  nik: text('nik').unique().notNull(),
  namaKk: text('nama_kk').notNull(),
  rt: text('rt').notNull(),
  rw: text('rw').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});

// ── QR Codes ───────────────────────────────────────────
export const qrCodes = sqliteTable('qr_codes', {
  id: text('id').primaryKey(),
  wargaId: text('warga_id').references(() => warga.id).notNull(),
  qrToken: text('qr_token').unique().notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// ── Transaksi (Jimpitan & Karangtaruna) ────────────────
export const transaksi = sqliteTable('transaksi', {
  id: text('id').primaryKey(),
  noTransaksi: text('no_transaksi').unique().notNull(),
  wargaId: text('warga_id').references(() => warga.id),
  petugasId: text('petugas_id').references(() => users.id),
  tanggal: text('tanggal').notNull(),
  nominal: integer('nominal').notNull(),
  kategori: text('kategori').default('Kas Jimpitan'),
  jenis: text('jenis').default('Masuk'), // 'Masuk' or 'Keluar'
  uraian: text('uraian').default(''),
  status: text('status').default('Success'),
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});

// ── Kas Karangtaruna (Buku Besar) ───────────────────────
export const kasKarangtaruna = sqliteTable('kas_karangtaruna', {
  id: text('id').primaryKey(),
  transaksiId: text('transaksi_id').references(() => transaksi.id),
  jenis: text('jenis').notNull(),
  nominal: integer('nominal').notNull(),
  saldoAkhir: integer('saldo_akhir').notNull(),
  uraian: text('uraian').notNull(),
  tanggal: text('tanggal').default(sql`(datetime('now','localtime'))`),
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});

// ── Anggota Karangtaruna ───────────────────────────────
export const anggota = sqliteTable('anggota', {
  id: text('id').primaryKey(),
  nama: text('nama').notNull(),
  jabatan: text('jabatan').notNull(),
  rt: text('rt').default(''),
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});

// ── Notifications ──────────────────────────────────────
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'), // 'info', 'success', 'warning', 'alert'
  targetRole: text('target_role').default('Semua'), // 'Semua', 'Super Admin', 'Bendahara', etc.
  senderId: text('sender_id').references(() => users.id), // null if system
  isRead: integer('is_read', { mode: 'boolean' }).default(false), // Simple global read status for simplicity, or we can leave it
  createdAt: text('created_at').default(sql`(datetime('now','localtime'))`),
});
