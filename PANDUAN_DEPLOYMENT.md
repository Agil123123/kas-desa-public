# Panduan Peluncuran (Deployment) NawaPintar 🚀

Untuk mengangkat aplikasi NawaPintar agar bisa diakses oleh seluruh warga melalui peramban internet atau dipasang di HP mereka, kita perlu menempatkan kode kita ke penyedia *server cloud* gratis. 

Karena kita tidak memiliki Git CLI, berikut adalah alur terlengkap dan termudah untuk meluncurkan sistem ke **Vercel** (untuk *hosting* antarmuka) dan **Turso** (untuk *hosting database*).

---

## TAHAP 1: Memindahkan Database Lokal ke Cloud (Turso)

Karena Vercel tidak bisa menyimpan *database* SQLite kita (`sqlite.db`) secara permanen, kita wajib memindahkannya ke Turso.

1. Buka peramban dan daftar ke **[Turso.tech](https://turso.tech)** (Bisa *login* dengan GitHub).
2. Setelah masuk ke *dashboard*, klik tombol **"Create Database"**.
3. Beri nama *database* Anda (misal: `nawapintar-db`), lalu pilih lokasi *server* terdekat (Singapore - `sin`).
4. Setelah dibuat, klik nama *database*-nya. Anda perlu menyalin 2 hal penting:
   - **Database URL:** Biasanya berawalan `libsql://nawapintar-db-agil123.turso.io`. (Tombol *copy* ada di halaman utama).
   - **Auth Token:** Klik tombol **"Generate Token"** (atau ikon kunci/gembok). Salin teks panjang (Token) tersebut.
5. Simpan URL dan Token ini di Notepad atau biarkan jendelanya terbuka.

---

## TAHAP 2: Mengunggah Kode ke GitHub

Vercel menarik kode aplikasi langsung dari GitHub. Karena perintah `git` belum aktif di komputer ini, mari unggah secara manual.

1. Buka **[GitHub.com](https://github.com)** dan buat akun jika belum punya.
2. Klik ikon `+` di kanan atas, pilih **"New repository"**.
3. Beri nama repositori (misal: `NawaPintar`), jadikan **Private**, lalu klik **Create repository**.
4. Di halaman repositori baru, klik tautan **"uploading an existing file"** (berada di bagian tengah bawah layar).
5. Buka **File Explorer** komputer Anda, dan arahkan ke folder `c:\Users\ASUS\Documents\Kas-Karangtaruna`.
6. Blok **semua file dan folder** di sana (KECUALI `node_modules` dan `.next`). Tarik/Seret *(drag and drop)* file tersebut ke area kotak unggah di halaman GitHub tadi.
7. Tunggu hingga semua terunggah, beri pesan *commit* (misal: "Init NawaPintar"), lalu klik **Commit changes**.

> [!TIP]
> Jika jumlah fail melebihi batas *upload* manual GitHub, saya sarankan Anda mengunduh **GitHub Desktop**, lalu Anda bisa melakukan sinkronisasi otomatis dari folder `Kas-Karangtaruna` Anda ke sana.

---

## TAHAP 3: Meluncurkan ke Vercel

1. Buka **[Vercel.com](https://vercel.com)** dan daftar/masuk dengan akun GitHub Anda.
2. Di halaman *Dashboard*, klik **"Add New..."** -> **"Project"**.
3. Di bagian *"Import Git Repository"*, cari repositori `NawaPintar` yang baru Anda buat, lalu klik **Import**.
4. Di halaman **Configure Project**, ubah beberapa pengaturan ini secara cermat:
   - **Root Directory:** Klik edit, pilih folder `frontend`, lalu konfirmasi.
   - Buka menu tarik turun **"Build and Output Settings"**.
   - Di kolom **Install Command**, aktifkan mode *Override* lalu ketik persis seperti ini:
     `npm install && cd ../backend && npm install`
   - Buka menu tarik turun **"Environment Variables"**.
   - Masukkan 2 variabel rahasia yang Anda dapat dari Turso tadi:
     - *Name:* `DATABASE_URL` | *Value:* (Tempel URL Turso Anda) -> Klik **Add**
     - *Name:* `DATABASE_AUTH_TOKEN` | *Value:* (Tempel Token Turso Anda) -> Klik **Add**
5. Terakhir, klik **Deploy**.

Proses ini memakan waktu sekitar 2-3 menit. Jika sukses, Vercel akan memberikan Anda tautan domain gratis (misal: `nawapintar.vercel.app`) yang sudah bisa dibagikan ke warga RT Anda!

---

## TAHAP 4: Sinkronisasi Skema Database Turso

Karena Turso Anda baru saja dibuat, isinya masih kosong. Agar tabel-tabel (`warga`, `transaksi`, `users`) terbentuk di Turso, kita perlu menjalankan migrasi satu kali dari komputer Anda.

Kembali ke IDE / Terminal (di folder `backend`), jalankan perintah:
```bash
$env:DATABASE_URL="libsql://nawapintar-db-agil.turso.io"
$env:DATABASE_AUTH_TOKEN="eyJhbG..."
npm run db:push
```
*Ganti teks hijau di atas dengan URL dan Token asli Anda. Setelah selesai, semua sudah terhubung secara online!*
