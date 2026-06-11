import { z } from 'zod';

// ── Transaksi Input Validation ─────────────────────────
export const transaksiSchema = z.object({
  wargaId: z.string().nullable().optional(),
  nominal: z.number().int('Nominal harus bilangan bulat').positive('Nominal harus bilangan positif').max(100_000_000, 'Nominal terlalu besar (maks 100 juta)'),
  kategori: z.enum(['Kas Jimpitan', 'Kas Karangtaruna'], {
    message: 'Kategori harus Kas Jimpitan atau Kas Karangtaruna',
  }),
  jenis: z.enum(['Masuk', 'Keluar'], {
    message: 'Jenis harus Masuk atau Keluar',
  }),
  uraian: z.string().max(500, 'Uraian terlalu panjang (maks 500 karakter)').optional().default(''),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format tanggal harus YYYY-MM-DD').optional(),
});

// ── Kas Karangtaruna Input Validation ──────────────────
export const kasKarangtarunaSchema = z.object({
  transaksiId: z.string().nullable().optional(),
  jenis: z.enum(['Masuk', 'Keluar'], {
    message: 'Jenis harus Masuk atau Keluar',
  }),
  nominal: z.number().int('Nominal harus bilangan bulat').positive('Nominal harus bilangan positif').max(100_000_000, 'Nominal terlalu besar'),
  uraian: z.string().min(1, 'Uraian wajib diisi').max(500, 'Uraian terlalu panjang'),
  tanggal: z.string().optional(),
});

// ── Warga Input Validation ─────────────────────────────
export const wargaSchema = z.object({
  namaKk: z.string().min(1, 'Nama KK wajib diisi').max(200),
  nik: z.string().max(20).optional(),
  rt: z.string().min(1, 'RT wajib diisi').max(5),
  rw: z.string().max(5).optional().default('04'),
});

// ── Notification Input Validation ──────────────────────
export const notificationSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  message: z.string().min(1, 'Pesan wajib diisi').max(1000),
  type: z.string().max(50).optional().default('info'),
  targetRole: z.string().max(50).optional().default('Semua'),
});

// ── User Input Validation ──────────────────────────────
export const userSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['Anggota', 'Petugas', 'Bendahara', 'Admin', 'Super Admin']),
  isActive: z.boolean().optional().default(true),
});

// ── Transaksi Update Validation ────────────────────────
export const transaksiUpdateSchema = z.object({
  nominal: z.number().int().positive('Nominal harus positif').max(100_000_000).optional(),
  jenis: z.enum(['Masuk', 'Keluar']).optional(),
  uraian: z.string().max(500).optional(),
  status: z.string().max(50).optional(),
});
