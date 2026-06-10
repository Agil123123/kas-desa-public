import { db } from './index';
import { users, warga, transaksi, kasKarangtaruna, rt, anggota, pengaturan } from './schema';

async function main() {
  console.log('🌱 Seeding database...');

  // ── Pengaturan ──────────────────────────────────────
  await db.insert(pengaturan).values({
    id: 'cfg-1',
    namaOrganisasi: 'Karangtaruna Bhakti Karya',
    alamat: 'Jl. Merdeka No. 45, Desa Sukamaju, Kec. Jati, Kab. Kudus',
    dusun: 'Sukamaju',
    rw: '04',
    targetJimpitan: 30000,
  }).onConflictDoNothing();

  // ── Master RT ───────────────────────────────────────
  await db.insert(rt).values([
    { id: 'rt-1', nomor: '01', ketuaRt: 'Bapak Sudirman', jumlahKk: 15 },
    { id: 'rt-2', nomor: '02', ketuaRt: 'Bapak Hadi', jumlahKk: 20 },
    { id: 'rt-3', nomor: '03', ketuaRt: 'Bapak Mulyono', jumlahKk: 10 },
  ]).onConflictDoNothing();

  // ── Users ───────────────────────────────────────────
  await db.insert(users).values([
    { id: 'usr-1', name: 'Agil', email: 'admin@jimpitan.desa', role: 'Super Admin' },
    { id: 'usr-2', name: 'Mas Eko', email: 'petugas@jimpitan.desa', role: 'Petugas' },
    { id: 'usr-3', name: 'Bu Sari', email: 'bendahara@jimpitan.desa', role: 'Bendahara' },
  ]).onConflictDoNothing();

  // ── Warga ───────────────────────────────────────────
  await db.insert(warga).values([
    { id: 'wrg-1', kodeUnik: 'QR-001', nik: '3301123456780001', namaKk: 'Bapak Budi Santoso', rt: '01', rw: '04' },
    { id: 'wrg-2', kodeUnik: 'QR-002', nik: '3301123456780002', namaKk: 'Ibu Siti Aminah', rt: '02', rw: '04' },
    { id: 'wrg-3', kodeUnik: 'QR-003', nik: '3301123456780003', namaKk: 'Bapak Joko Widodo', rt: '03', rw: '04' },
    { id: 'wrg-4', kodeUnik: 'QR-004', nik: '3301123456780004', namaKk: 'Ibu Ratna Sari', rt: '02', rw: '04' },
    { id: 'wrg-5', kodeUnik: 'QR-005', nik: '3301123456780005', namaKk: 'Mas Eko Kurniawan', rt: '01', rw: '04' },
  ]).onConflictDoNothing();

  // ── Anggota Karangtaruna ────────────────────────────
  await db.insert(anggota).values([
    { id: 'agt-1', nama: 'Agil', jabatan: 'Ketua Karangtaruna', rt: '01' },
    { id: 'agt-2', nama: 'Mas Eko', jabatan: 'Petugas Jimpitan', rt: '01' },
    { id: 'agt-3', nama: 'Mbak Nur', jabatan: 'Sekretaris', rt: '02' },
    { id: 'agt-4', nama: 'Kang Budi', jabatan: 'Bendahara', rt: '03' },
  ]).onConflictDoNothing();

  // ── Transaksi Jimpitan ──────────────────────────────
  await db.insert(transaksi).values([
    { id: 'trx-1', noTransaksi: 'JMP-001', wargaId: 'wrg-1', petugasId: 'usr-2', tanggal: '2026-06-10 08:30', nominal: 2000, kategori: 'Kas Jimpitan', jenis: 'Masuk', uraian: 'Setoran jimpitan harian', status: 'Success' },
    { id: 'trx-2', noTransaksi: 'JMP-002', wargaId: 'wrg-2', petugasId: 'usr-2', tanggal: '2026-06-10 08:35', nominal: 5000, kategori: 'Kas Jimpitan', jenis: 'Masuk', uraian: 'Setoran jimpitan harian', status: 'Success' },
    { id: 'trx-3', noTransaksi: 'JMP-003', wargaId: 'wrg-4', petugasId: 'usr-1', tanggal: '2026-06-09 16:10', nominal: 10000, kategori: 'Kas Jimpitan', jenis: 'Masuk', uraian: 'Setoran jimpitan harian', status: 'Success' },
    { id: 'trx-4', noTransaksi: 'JMP-004', wargaId: 'wrg-3', petugasId: 'usr-1', tanggal: '2026-06-09 15:45', nominal: 5000, kategori: 'Kas Jimpitan', jenis: 'Masuk', uraian: 'Setoran jimpitan harian', status: 'Success' },
    { id: 'trx-5', noTransaksi: 'JMP-005', wargaId: 'wrg-5', petugasId: 'usr-2', tanggal: '2026-06-08 09:00', nominal: 25000, kategori: 'Kas Jimpitan', jenis: 'Masuk', uraian: 'Setoran jimpitan mingguan', status: 'Success' },
  ]).onConflictDoNothing();

  // ── Transaksi Kas Karangtaruna ──────────────────────
  await db.insert(transaksi).values([
    { id: 'trx-k1', noTransaksi: 'KAS-001', wargaId: null, petugasId: 'usr-3', tanggal: '2026-06-10 10:00', nominal: 100000, kategori: 'Kas Karangtaruna', jenis: 'Masuk', uraian: 'Penyewaan Tenda Organisasi', status: 'Success' },
    { id: 'trx-k2', noTransaksi: 'KAS-002', wargaId: null, petugasId: 'usr-3', tanggal: '2026-06-09 14:00', nominal: 150000, kategori: 'Kas Karangtaruna', jenis: 'Keluar', uraian: 'Pembelian Alat Kebersihan (Sapu & Trashbag)', status: 'Success' },
    { id: 'trx-k3', noTransaksi: 'KAS-003', wargaId: null, petugasId: 'usr-3', tanggal: '2026-06-08 09:00', nominal: 500000, kategori: 'Kas Karangtaruna', jenis: 'Masuk', uraian: 'Sumbangan Donatur (Bapak Kades)', status: 'Success' },
    { id: 'trx-k4', noTransaksi: 'KAS-004', wargaId: null, petugasId: 'usr-3', tanggal: '2026-06-05 11:00', nominal: 2500000, kategori: 'Kas Karangtaruna', jenis: 'Masuk', uraian: 'Dana Desa Termin 2', status: 'Success' },
  ]).onConflictDoNothing();

  // ── Kas RT (Buku Besar) ─────────────────────────────
  await db.insert(kasKarangtaruna).values([
    { id: 'kr-1', transaksiId: 'trx-k1', jenis: 'Masuk', nominal: 100000, saldoAkhir: 15985000, uraian: 'Penyewaan Tenda Organisasi', tanggal: '2026-06-10 10:00' },
    { id: 'kr-2', transaksiId: 'trx-k2', jenis: 'Keluar', nominal: 150000, saldoAkhir: 15885000, uraian: 'Pembelian Alat Kebersihan (Sapu & Trashbag)', tanggal: '2026-06-09 14:00' },
    { id: 'kr-3', transaksiId: 'trx-k3', jenis: 'Masuk', nominal: 500000, saldoAkhir: 16035000, uraian: 'Sumbangan Donatur (Bapak Kades)', tanggal: '2026-06-08 09:00' },
    { id: 'kr-4', transaksiId: 'trx-k4', jenis: 'Masuk', nominal: 2500000, saldoAkhir: 15535000, uraian: 'Dana Desa Termin 2', tanggal: '2026-06-05 11:00' },
  ]).onConflictDoNothing();

  console.log('✅ Seeding complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
