# NawaPintar (Jimpitan Desa Digital)

NawaPintar adalah sistem informasi digital berbasis web (PWA) untuk pencatatan dan pengelolaan keuangan organisasi desa (seperti Karangtaruna atau RT/RW) secara transparan, akurat, dan real-time. Sistem ini mengotomatiskan alur pencatatan iuran (jimpitan) dari yang manual menggunakan buku catatan menjadi sistem pemindaian QR Code yang cepat.

## 🌟 Fitur Utama

- **Scan & Input Cepat:** Petugas dapat memindai QR Code di rumah warga/anggota menggunakan kamera smartphone untuk mencatat iuran dalam hitungan detik.
- **Dashboard Real-time:** Pantau total pemasukan, grafik mingguan/bulanan, dan progres pencapaian target organisasi secara real-time.
- **Buku Kas Otomatis:** Setiap transaksi yang tercatat otomatis masuk ke buku kas (ledger) tanpa perlu input ulang manual.
- **Multi-Role User:** Akses sistem dibedakan sesuai peran (Admin, Bendahara, Petugas, Anggota).
- **Ekspor Laporan:** Unduh laporan keuangan bulanan dalam format Excel untuk keperluan rapat organisasi.
- **PWA Ready:** Aplikasi dapat diinstal langsung di perangkat mobile untuk kemudahan akses petugas di lapangan.

## 💻 Tech Stack

Proyek ini dibangun menggunakan arsitektur monorepo sederhana yang terbagi menjadi:

### Frontend
- **Framework:** Next.js 16.x (App Router)
- **UI/Styling:** Tailwind CSS v4, Recharts (untuk grafik)
- **QR Scanner:** react-qr-scanner, qrcode.react

### Backend & Database
- **Database:** SQLite
- **ORM:** Drizzle ORM (`@libsql/client`)
- **API:** Next.js Route Handlers

## 🚀 Cara Menjalankan Proyek Secara Lokal

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (disarankan versi 20+) di mesin Anda.

### 1. Kloning Repositori & Instalasi

```bash
git clone https://github.com/Agil123123/Kas-Karangtaruna.git
cd Kas-Karangtaruna
```

Karena proyek ini menggunakan *workspaces* npm, instal semua dependensi dari *root directory*:
```bash
npm install
```

### 2. Konfigurasi Database (Backend)

Masuk ke folder `backend` untuk menyiapkan database SQLite lokal:

```bash
cd backend

# Buat skema database ke SQLite
npm run db:push

# (Opsional) Isi database dengan data awal (seeding)
npm run db:seed

# Buka Drizzle Studio untuk melihat dan mengelola isi database melalui UI web
npm run db:studio
```
Drizzle studio biasanya berjalan di `https://local.drizzle.studio`.

### 3. Menjalankan Frontend

Buka terminal baru, masuk ke folder `frontend`, dan jalankan *development server*:

```bash
cd frontend
npm run dev
```
Aplikasi akan dapat diakses melalui `http://localhost:3000`.

## 📂 Struktur Direktori

```
.
├── backend/                  # Modul Database & ORM
│   ├── db/                   # Konfigurasi koneksi & Seed data
│   │   ├── index.ts
│   │   ├── schema.ts         # Skema tabel database (warga, transaksi, kas, dll)
│   │   └── seed.ts           # Skrip pengisian data dummy
│   ├── drizzle.config.ts     # Konfigurasi Drizzle
│   └── package.json
├── frontend/                 # Modul Web Application (Next.js)
│   ├── src/
│   │   ├── app/              # Next.js App Router (Halaman & API Routes)
│   │   └── components/       # Reusable UI components
│   ├── public/               # Asset statis
│   └── package.json
└── package.json              # Konfigurasi Workspace NPM
```

## 🔒 Akses Pengguna (Sesuai Seed)

Jika Anda menjalankan `npm run db:seed` di backend, Anda dapat masuk menggunakan akun default berikut:

- **Admin/Ketua:** `admin@jimpitan.desa` / password: `password123`
- **Bendahara:** `bendahara@jimpitan.desa` / password: `password123`
- **Petugas:** `petugas@jimpitan.desa` / password: `password123`
- **Anggota:** `anggota@jimpitan.desa` / password: `password123`

## 🛠️ Panduan Penyesuaian (Jika Anda Melakukan Clone/Fork)

Jika Anda adalah pengembang atau organisasi lain yang mengunduh (clone/fork) *source code* ini untuk diterapkan di desa/komunitas Anda sendiri, Anda wajib melakukan penyesuaian pada beberapa hal berikut sebelum aplikasi dapat berjalan dengan lancar:

### 1. Variabel Lingkungan (`.env`)
Karena file `.env` tidak disertakan di GitHub demi keamanan, buatlah file `.env` baru di direktori `frontend` yang berisi konfigurasi berikut:
- `NEXTAUTH_SECRET`: Generate kunci rahasia untuk autentikasi sesi (misal menggunakan perintah `openssl rand -base64 32`).
- Kredensial Database (e.g., `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`) jika Anda menggunakan Drizzle dengan Turso SQLite, atau `DATABASE_URL` standar.
- `GOOGLE_CLIENT_EMAIL` & `GOOGLE_PRIVATE_KEY`: Untuk mengaktifkan fitur sinkronisasi pembukuan otomatis ke Google Sheets.

### 2. Branding (Identitas Aplikasi)
Ubah identitas default (NawaPintar) menjadi nama organisasi Anda:
- **Nama & Deskripsi Web:** Edit konfigurasi `metadata` di file `frontend/src/app/layout.tsx`.
- **Progressive Web App (PWA):** Sesuaikan `name` dan `short_name` pada file `frontend/public/manifest.json`.
- **Logo & Ikon:** Ganti gambar/ikon standar seperti `apple-icon.png` di folder `frontend/public/` dan logo SVG di komponen Navbar/Sidebar.

### 3. Akun Super Admin Bawaan Pabrik
Setelah instalasi selesai, sesuaikan kredensial Admin awal Anda di file skrip *seeding* database (contoh: `backend/db/seed.ts`). Ubah *Email* dan *Password* agar Anda bisa *login* untuk pertama kalinya.

### 4. Struktur Nama Google Sheets (Wajib Presisi)
Jika Anda mengaktifkan fitur ekspor Google Sheets di panel **Pengaturan** aplikasi (dengan memasukkan Spreadsheet ID), Anda wajib membuat *Tab/Sheet* di file Excel Google tersebut dengan nama persis seperti di bawah ini:
- `Kas Karangtaruna`
- `Kas Jimpitan`

*(Peringatan: Jika Anda mengubah nama sheet ini di Google Sheets, Anda juga harus menyesuaikan string "Kas Karangtaruna" dan "Kas Jimpitan" pada file `frontend/src/app/api/transaksi/route.ts` dan fungsi terkait lainnya).*

### 5. Opsi RT/Lingkungan
Jika ada pembatasan/opsi RT dan RW yang tertulis manual (*hardcoded*) pada form pendaftaran warga (terutama jika tidak diambil dinamis dari database), carilah opsi tersebut di file antarmuka (contoh `frontend/src/app/(dashboard)/warga/page.tsx`) dan ubah jumlah opsinya sesuai dengan jumlah RT di desa Anda.

---
&copy; NawaPintar (Jimpitan Desa Digital) - Dikembangkan untuk kebutuhan digitalisasi organisasi masyarakat desa.
