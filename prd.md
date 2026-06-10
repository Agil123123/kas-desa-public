
PRODUCT REQUIREMENTS DOCUMENT
Jimpitan Desa Digital
Sistem Digitalisasi Jimpitan RT/RW Berbasis QR Code & PWA

Versi Dokumen	v1.0
Status	Draft — Untuk Review
Tanggal	Juni 2026
Penulis	Tim Pengembang Jimpitan Desa
Platform	Laravel 12 · Next.js 15 · PostgreSQL · PWA
Target Rilis	Q3 2026 (MVP v1.0)
 
1. Executive Summary
Jimpitan Desa Digital adalah platform web berbasis PWA (Progressive Web App) yang meredigitalisasi proses pengumpulan dana jimpitan RT/RW dari alur manual menggunakan buku catatan menjadi sistem digital real-time berbasis pemindaian QR Code.

Sistem ini memungkinkan petugas jimpitan menggunakan smartphone Android untuk memindai QR Code di setiap rumah warga, memasukkan nominal yang ditemukan, dan secara otomatis menyimpan data ke database, memperbarui buku kas RT, serta menghasilkan rekap harian, mingguan, bulanan, dan tahunan tanpa input ulang.

Permasalahan Utama yang Diselesaikan
• Tidak diketahuinya kontribusi individual masing-masing warga
• Sulitnya mendeteksi warga yang rutin vs. tidak pernah mengisi
• Tidak ada laporan digital yang dapat diaudit dan diekspor
• Risiko kesalahan pencatatan manual dan kehilangan data historis
• Tidak ada mekanisme pemantauan real-time bagi pengurus RT

2. Latar Belakang & Problem Statement
2.1 Konteks Bisnis
Jimpitan adalah tradisi pengumpulan uang iuran masyarakat di lingkungan RT/RW yang dilakukan secara berkala (harian atau mingguan). Petugas berkeliling dari rumah ke rumah mengambil uang dari kotak jimpitan yang dipasang di depan setiap rumah.

Saat ini, seluruh proses pencatatan dilakukan secara manual menggunakan buku tulis, tanpa sistem verifikasi, tanpa histori per warga, dan tanpa kemampuan pelaporan terstruktur. Ketika pengurus RT ingin mengetahui warga mana yang rutin berkontribusi atau total pendapatan bulan tertentu, mereka harus menelusuri buku catatan secara manual.

2.2 Problem Statement
#	Masalah	Dampak	Prioritas
P01	Tidak ada pencatatan per warga	Tidak dapat mendeteksi partisipasi individual	Kritis
P02	Rekap harus dihitung manual	Error manusia, waktu lama, tidak real-time	Kritis
P03	Tidak ada laporan digital	Tidak bisa ekspor, audit, atau arsip jangka panjang	Tinggi
P04	Tidak ada monitoring warga aktif/tidak	Pengurus tidak tahu siapa yang perlu diingatkan	Tinggi
P05	Kas RT tidak terintegrasi	Input ulang manual berisiko duplikasi & error	Sedang
P06	Tidak ada target terukur	Tidak bisa evaluasi pencapaian vs. anggaran	Sedang

3. Tujuan Produk
3.1 Tujuan Bisnis
1.	Mendigitalisasi seluruh alur pengumpulan dan pencatatan jimpitan RT/RW.
2.	Memberikan visibilitas real-time kepada pengurus RT atas kondisi keuangan dan partisipasi warga.
3.	Mengurangi beban administratif petugas jimpitan hingga < 5 detik input per rumah.
4.	Menghasilkan laporan keuangan yang dapat diaudit dan diekspor untuk keperluan rapat RT.

3.2 Tujuan Teknis
5.	Membangun API backend Laravel 12 dengan arsitektur RESTful yang mendukung 1.000+ warga.
6.	Membangun frontend Next.js 15 sebagai PWA yang dapat diinstall di Android tanpa App Store.
7.	Mengintegrasikan pemindai QR Code berbasis kamera tanpa plugin eksternal berbayar.
8.	Mengotomatiskan sinkronisasi data ke Google Sheets untuk aksesibilitas non-teknis.

4. Scope Produk
4.1 In-Scope (Versi 1.0)
Modul	Fitur	Deskripsi Singkat
Autentikasi	Login Multi-Role	Super Admin, Ketua RT, Bendahara, Petugas
Manajemen Warga	CRUD + QR	Data lengkap warga + generate QR Code unik
Scan & Input	QR Scanner PWA	Kamera smartphone → identifikasi warga → input nominal
Transaksi	Input Jimpitan	Simpan transaksi, auto-entry kas RT, rekap otomatis
Dashboard	Statistik Real-time	Ringkasan hari ini/minggu/bulan/tahun + grafik
Rekap	Laporan Multi-Periode	Harian, mingguan, bulanan, tahunan
Ekspor	Excel & CSV	Download laporan .xlsx per periode
Kas RT	Buku Kas Otomatis	Auto-entry dari transaksi jimpitan
Target	Target Bulanan	Set target + tracking persentase pencapaian
Notifikasi	Alert Sistem	Peringatan warga belum tercatat, pendapatan menurun
Audit Log	Log Aktivitas	Catat seluruh aksi pengguna

4.2 Out-of-Scope (v1.0, masuk v2.0+)
•	Peta rumah warga interaktif (Google Maps)
•	Notifikasi WhatsApp via API gateway
•	Sinkronisasi Google Sheets real-time
•	Aplikasi native Android (React Native)
•	Multi-RT dalam satu instance sistem
•	OCR kamera untuk baca nominal otomatis

5. User Personas
Persona 1 — Pak RT (Super Admin / Ketua RT)
Atribut	Detail
Nama Contoh	Bapak Slamet, 52 tahun
Peran	Ketua RT 04, juga bertindak sebagai Super Admin sistem
Literasi Digital	Sedang — terbiasa dengan WhatsApp dan Excel sederhana
Kebutuhan Utama	Melihat total pemasukan, memantau warga tidak aktif, mencetak laporan bulanan
Pain Point	Harus menghitung manual dari buku tiap akhir bulan untuk laporan ke RW
Akses	Smartphone Android, sesekali lewat laptop

Persona 2 — Mas Eko (Petugas Jimpitan)
Atribut	Detail
Nama Contoh	Mas Eko, 27 tahun, warga aktif RT
Peran	Petugas yang berkeliling mengambil uang jimpitan tiap minggu
Literasi Digital	Cukup tinggi — aktif media sosial, familiar dengan kamera smartphone
Kebutuhan Utama	Proses input cepat (< 5 detik per rumah), antarmuka simpel, tidak perlu training lama
Pain Point	Sering lupa rumah mana yang sudah/belum dikunjungi, takut salah catat nominal
Akses	Hanya smartphone Android

Persona 3 — Bu Sari (Bendahara)
Atribut	Detail
Nama Contoh	Ibu Sari, 44 tahun
Peran	Bendahara RT, bertanggung jawab atas buku kas dan laporan keuangan
Literasi Digital	Sedang — terbiasa Excel, jarang pakai aplikasi web baru
Kebutuhan Utama	Melihat buku kas otomatis, ekspor Excel untuk arsip, laporan bulanan siap cetak
Pain Point	Harus input ulang data jimpitan ke buku kas secara manual setiap minggu
Akses	Laptop & smartphone

6. User Stories & Acceptance Criteria
6.1 Modul Autentikasi
ID	User Story	Acceptance Criteria	Prioritas
US-01	Sebagai pengguna, saya ingin login dengan email & password agar dapat mengakses sistem sesuai peran saya.	- Form email + password - Token JWT dikembalikan - Redirect ke dashboard sesuai role - Error jelas jika salah kredensial	Must Have
US-02	Sebagai pengguna, saya ingin tetap login selama 30 hari agar tidak perlu login ulang setiap hari.	- Token berlaku 30 hari - Refresh otomatis sebelum expired	Must Have
US-03	Sebagai admin, saya ingin bisa mengganti password pengguna agar keamanan akun tetap terjaga.	- Form ganti password dengan konfirmasi - Validasi password lama - Berhasil tanpa logout paksa	Should Have

6.2 Modul Scan & Input Jimpitan
ID	User Story	Acceptance Criteria	Prioritas
US-10	Sebagai petugas, saya ingin memindai QR Code rumah warga agar sistem otomatis menampilkan data warga yang tepat.	- Kamera terbuka dalam 1 detik - QR berhasil diidentifikasi < 2 detik - Tampil nama, alamat, status bayar minggu ini - Error jelas jika QR tidak valid	Must Have
US-11	Sebagai petugas, saya ingin memasukkan nominal uang dan langsung menyimpannya agar proses per rumah selesai < 5 detik.	- Input nominal dengan keypad angka - Tombol Simpan menonjol - Konfirmasi sukses muncul < 1 detik - Langsung siap scan rumah berikutnya	Must Have
US-12	Sebagai petugas, saya ingin melihat riwayat 5 transaksi terakhir warga agar tahu apakah mereka rutin membayar.	- Tampil tanggal + nominal 5 transaksi terakhir - Label "Sudah bayar minggu ini" jika ada	Should Have
US-13	Sebagai petugas, saya ingin bisa input nominal 0 untuk rumah yang kosong agar tetap tercatat sudah dikunjungi.	- Nominal 0 diizinkan - Status tersimpan sebagai "dikunjungi, kosong"	Should Have

6.3 Modul Dashboard & Laporan
ID	User Story	Acceptance Criteria	Prioritas
US-20	Sebagai ketua RT, saya ingin melihat total pemasukan hari ini, minggu ini, bulan ini, dan tahun ini di satu halaman.	- 4 kartu metrik di atas dashboard - Data real-time, refresh tanpa reload	Must Have
US-21	Sebagai ketua RT, saya ingin melihat grafik tren pemasukan mingguan agar dapat mendeteksi penurunan partisipasi.	- Bar chart 8 minggu terakhir - Nilai Rp di tooltip hover	Must Have
US-22	Sebagai bendahara, saya ingin mengunduh laporan bulanan dalam format Excel agar bisa diarsipkan dan dibagikan ke rapat RT.	- Download .xlsx dengan satu klik - Berisi semua transaksi bulan dipilih - Ada baris TOTAL di akhir	Must Have
US-23	Sebagai ketua RT, saya ingin melihat daftar warga yang belum membayar bulan ini agar bisa ditindaklanjuti.	- Daftar warga + alamat + no HP - Dapat difilter per RT	Should Have
US-24	Sebagai admin, saya ingin melihat persentase pencapaian target bulan ini agar dapat mengevaluasi keberhasilan pengumpulan.	- Progress bar target vs. realisasi - Persentase ditampilkan jelas	Should Have

6.4 Modul Manajemen Warga
ID	User Story	Acceptance Criteria	Prioritas
US-30	Sebagai admin, saya ingin menambahkan data warga baru beserta QR Code otomatis agar warga langsung dapat digunakan di sistem.	- Form warga lengkap - QR Code di-generate otomatis setelah simpan - Bisa cetak/download QR Code	Must Have
US-31	Sebagai admin, saya ingin mencari warga berdasarkan nama atau NIK agar proses pencarian cepat dari 1.000+ data.	- Search real-time (debounce 300ms) - Hasil muncul < 500ms	Must Have
US-32	Sebagai admin, saya ingin melihat profil lengkap warga termasuk statistik kontribusi total dan kategori aktivitas.	- Total kontribusi, jumlah transaksi, rata-rata - Badge: Aktif / Kurang Aktif / Tidak Aktif - Riwayat pembayaran paginated	Should Have
US-33	Sebagai admin, saya ingin mencetak QR Code massal untuk semua warga agar dapat langsung ditempel di kotak jimpitan.	- Generate PDF multi-halaman - Tiap QR disertai nama + alamat - Layout rapi 4 per halaman A4	Must Have

7. Functional Requirements
FR-01 Manajemen Autentikasi & Otorisasi
•	Sistem menggunakan token-based auth (Laravel Sanctum) dengan masa berlaku 30 hari.
•	Setiap endpoint API dilindungi middleware autentikasi dan pengecekan role (RBAC).
•	Empat role: super_admin, ketua_rt, bendahara, petugas — dengan hak akses berbeda per endpoint.
•	Login gagal 5x berturut-turut dalam 10 menit menghasilkan lockout 15 menit.

FR-02 Pemindaian QR Code
•	QR Code berisi URL dengan token unik 48 karakter (case-sensitive, URL-safe).
•	Satu warga hanya memiliki satu QR aktif; generate ulang menonaktifkan QR lama.
•	Endpoint /api/v1/qr/scan/{token} mengembalikan data warga + statistik < 300ms.
•	QR Code error-correction level H (tahan kerusakan fisik hingga 30%).

FR-03 Transaksi Jimpitan
•	Satu transaksi minimal berisi: warga_id, nominal (boleh 0), petugas_id, tanggal, jam.
•	Setiap transaksi dengan nominal > 0 otomatis membuat entri masuk di tabel kas_rt.
•	Saldo kas_rt dihitung secara kumulatif (append-only ledger), tidak pernah diubah langsung.
•	Pembatalan transaksi hanya bisa dilakukan oleh super_admin dan dicatat di audit_log.

FR-04 Rekap Otomatis
•	Tabel rekap_harian diperbarui setiap kali ada transaksi baru (trigger via service layer).
•	Rekap mingguan dan bulanan dihitung on-demand dari tabel transaksi (tidak disimpan terpisah).
•	Rekap tahunan dihasilkan via query agregasi GROUP BY MONTH.

FR-05 Kategorisasi Warga
•	Aktif: minimal 3 transaksi > 0 dalam 30 hari terakhir.
•	Kurang Aktif: 1–2 transaksi > 0 dalam 30 hari terakhir.
•	Tidak Aktif: 0 transaksi > 0 dalam 30 hari terakhir.
•	Kategori dihitung dinamis saat profil warga diakses (computed attribute).

8. Non-Functional Requirements
Kategori	Requirement	Target Metrik
Performa	Response time API endpoint utama	< 300ms pada beban normal (100 req/menit)
Performa	Waktu render halaman scan (PWA)	< 1.5 detik termasuk buka kamera
Performa	Input per rumah (end-to-end)	< 5 detik dari scan hingga konfirmasi simpan
Skalabilitas	Kapasitas data warga	Minimal 1.000 warga tanpa degradasi performa
Skalabilitas	Transaksi per hari	Minimal 500 transaksi/hari tanpa antrean
Ketersediaan	Uptime sistem	99.5% (downtime maks. 3.6 jam/bulan)
Keamanan	Enkripsi transport	HTTPS wajib, TLS 1.2+
Keamanan	Password hashing	bcrypt dengan cost factor 12
Keamanan	Input validation	100% endpoint divalidasi via Form Request
Keamanan	Rate limiting	60 request/menit per IP pada semua endpoint
Aksesibilitas	Dukungan browser	Chrome for Android 90+, Safari iOS 14+
Aksesibilitas	Resolusi layar	Optimal pada 360px–428px (smartphone umum Indonesia)
Backup	Frekuensi backup database	Setiap hari pukul 02:00 WIB (pg_dump + gzip)
Backup	Retensi backup	Minimum 30 hari

9. Arsitektur Sistem
9.1 Stack Teknologi
Layer	Teknologi	Versi	Justifikasi
Backend API	Laravel	12.x	Ekosistem matang, Eloquent ORM, Sanctum auth, scheduler built-in
Frontend	Next.js	15.x	SSR + SSG, PWA support, App Router, TypeScript native
UI Framework	Tailwind CSS	4.x	Utility-first, mobile-first, tidak perlu desainer khusus
Database	PostgreSQL	16.x	JSONB, UUID native, full-text search, ACID compliant
Cache	Redis	7.x	Session storage, rate limiting, queue backend
QR Generator	simplesoftware/qrcode	Latest	PHP native, SVG/PNG output, no external API
QR Scanner	zxing-js/browser	0.21+	Browser native, no plugin, Google ZXing engine
Excel Ekspor	phpspreadsheet	2.x	Format xlsx native, styling, formula support
Google Sheets	google/apiclient	2.x	Official Google API client
Kontainerisasi	Docker + Compose	Latest	Reproducible environment, easy deployment
Web Server	Nginx	Alpine	Reverse proxy, SSL termination, static file serving

9.2 Arsitektur Deployment
Topologi Deployment (Single VPS)
Internet → Nginx (80/443) → PHP-FPM (Laravel API) + Next.js (3000)
                         ↓                    ↓
                    PostgreSQL (5432)     Redis (6379)
                         ↓
                  Volume: postgres_data
                         ↓
             Cron: pg_dump → /backups/*.sql.gz (02:00 WIB)

9.3 Estimasi Kebutuhan Server
Komponen	Minimum	Rekomendasi	Catatan
CPU	2 vCPU	4 vCPU	PHP-FPM + Next.js + PostgreSQL
RAM	2 GB	4 GB	PostgreSQL shared_buffers 512MB
Storage	20 GB SSD	50 GB SSD	Data + backup lokal 30 hari
OS	Ubuntu 22.04 LTS	Ubuntu 22.04 LTS	Long Term Support hingga 2027
Bandwidth	1 TB/bulan	2 TB/bulan	Cukup untuk 1.000 warga + admin
Biaya estimasi	Rp 100.000/bln	Rp 175.000/bln	Provider lokal: IDCloudHost, Niagahoster

10. Data Model
10.1 Entitas Utama
Tabel	Kolom Kunci	Relasi	Keterangan
users	id, nama, email, role, is_active	→ transaksi, audit_log	Pengguna sistem (4 role)
warga	id, kode_unik, nik, nama_kk, rt, rw, lat, lng	→ qr_codes, transaksi	Data rumah tangga
qr_codes	id, warga_id, qr_token, is_active	← warga	Satu aktif per warga
transaksi	id, no_transaksi, warga_id, petugas_id, tanggal, nominal	← warga, users → kas_rt	Inti sistem
kas_rt	id, transaksi_id, jenis, nominal, saldo_akhir	← transaksi	Ledger append-only
target_jimpitan	id, tahun, bulan, target_nominal	-	Target per bulan
rekap_harian	id, tanggal, total_dikunjungi, total_belum, total_terkumpul	-	Cache rekap harian
audit_log	id, user_id, aksi, tabel, data_lama, data_baru	← users	Immutable audit trail

11. API Contract (Ringkasan)
Base URL: /api/v1 · Auth: Bearer Token (Sanctum)
Method	Endpoint	Akses	Deskripsi
POST	/auth/login	Public	Login, dapatkan token
GET	/auth/me	Auth	Data user yang login
POST	/auth/logout	Auth	Invalidate token
GET	/warga	Admin+	List warga (search, filter, paginate)
POST	/warga	Admin+	Tambah warga baru + generate QR
GET	/warga/{id}	Auth	Detail + statistik + riwayat warga
PUT	/warga/{id}	Admin+	Edit data warga
GET	/qr/scan/{token}	Petugas+	Resolve QR → data warga (ENDPOINT UTAMA SCAN)
GET	/qr/generate/{id}	Admin+	Generate ulang QR warga
POST	/transaksi	Petugas+	Simpan transaksi (auto kas RT)
GET	/transaksi/today	Auth	Semua transaksi hari ini
GET	/dashboard/summary	Auth	Ringkasan metrik utama
GET	/dashboard/grafik/mingguan	Auth	Data grafik 8 minggu
GET	/rekap/bulanan	Admin+	Rekap detail per bulan
GET	/ekspor/bulanan	Admin+	Download Excel rekap bulanan
POST	/ekspor/sync-gsheets	Admin+	Sinkronisasi ke Google Sheets
GET	/kas/saldo	Bendahara+	Saldo kas RT saat ini
GET	/notifikasi	Auth	Daftar notifikasi user
GET	/audit-log	Super Admin	Log seluruh aktivitas

12. UI/UX Requirements
12.1 Prinsip Desain
•	Mobile-first: Seluruh antarmuka dirancang untuk layar 360px–428px (smartphone Android umum).
•	5-second rule: Alur scan QR → input nominal → simpan harus selesai dalam 5 detik.
•	Zero learning curve: Petugas tanpa latar IT harus bisa mengoperasikan hanya dengan briefing 10 menit.
•	Offline-capable: Halaman scan tetap bisa diakses jika koneksi terputus sesaat (Service Worker).
•	Contrast & readability: Font minimum 14px, warna teks kontras AAA (WCAG 2.1).

12.2 Alur Utama — Halaman Scan (Petugas)
Langkah	Aksi Pengguna	Respons Sistem	Waktu Target
1	Buka aplikasi, tap tombol Scan QR	Kamera terbuka, frame pemindai aktif	< 1 detik
2	Arahkan kamera ke QR Code rumah	QR terdeteksi, vibrate feedback	< 2 detik
3	Sistem menampilkan data warga	Nama, alamat, status bayar minggu ini	< 300ms API
4	Ketuk field nominal, masukkan angka	Keypad angka muncul otomatis	Instan
5	Tap tombol Simpan (hijau, besar)	Toast sukses, siap scan berikutnya	< 500ms

12.3 Komponen UI Kunci
•	QR Scanner: Video stream fullscreen dengan overlay frame hijau, tanpa tombol capture manual.
•	Nominal Input: Keypad angka custom (tanpa koma/titik), pre-fill Rp 1.000 sebagai default.
•	Status Badge: Warna semantis — hijau (aktif), kuning (kurang aktif), merah (tidak aktif).
•	Progress Bar Target: Visual gradient warna berubah saat mendekati/melampaui target.
•	Dashboard Cards: 4 kartu metrik utama di baris pertama, tapping membuka detail.

13. Keamanan & Kepatuhan Data
13.1 Kontrol Keamanan
Area	Kontrol	Implementasi
Autentikasi	Token-based, stateless	Laravel Sanctum, token 30 hari, refresh otomatis
Otorisasi	RBAC per endpoint	Middleware CheckRole, 4 level hak akses
Transport	Enkripsi end-to-end	HTTPS + TLS 1.2+ via Let's Encrypt (gratis)
Password	Hashing kuat	bcrypt cost=12, tidak pernah disimpan plain
Rate Limit	Anti brute-force	60 req/menit per IP, 5 login gagal → lockout
Input	Validasi ketat	Form Request Laravel, sanitasi semua input
QR Token	Unik & sulit ditebak	48 karakter random, Str::random() Laravel
Audit	Log immutable	Semua aksi CRUD + login dicatat, tidak bisa dihapus

13.2 Perlindungan Data Warga
•	NIK warga hanya dapat dilihat oleh super_admin dan ketua_rt — tidak tampil di dashboard petugas.
•	Nomor HP warga tidak ditampilkan di halaman scan (hanya tampil di profil dengan akses admin).
•	Data warga tidak dihapus permanen; hanya dinonaktifkan (soft delete) untuk keperluan audit.
•	Backup database dienkripsi sebelum disimpan ke storage eksternal (opsional v2.0).

14. Integrasi Eksternal
Integrasi	Tujuan	Versi	Catatan Implementasi
Google Sheets API v4	Sinkronisasi data ke spreadsheet pengurus	v4	Service account credentials, OAuth2
Google Maps JS API	Peta rumah warga + status kunjungan	Latest	Masuk scope v2.0
simplesoftware/qrcode	Generate QR Code PNG per warga	Latest	PHP library, tanpa external call
zxing-js/browser	Pemindaian QR via kamera smartphone	0.21+	Browser native, tidak perlu plugin
phpspreadsheet	Generate file .xlsx laporan	2.x	Full styling + formula support
WhatsApp Gateway	Notifikasi ke pengurus RT	API pihak ketiga	Masuk scope v2.0

15. Strategi Pengujian
15.1 Jenis Pengujian
Jenis	Cakupan	Tools	Target Coverage
Unit Test	Services, Models, Helpers	PHPUnit (Laravel)	> 80%
Feature Test	API Endpoints end-to-end	PHPUnit + HTTP Client	> 90% endpoint
Frontend Test	Komponen React kritis	Jest + React Testing Library	> 70%
E2E Test	Alur scan QR → simpan transaksi	Playwright	Happy path + error path
Load Test	API dengan 100 concurrent user	k6 atau Artillery	Response < 500ms
Security Test	Auth bypass, SQL injection	OWASP ZAP	Tidak ada critical finding

15.2 Test Scenario Kritis
9.	Scan QR valid → tampil data warga → input nominal → simpan → verifikasi kas RT ter-update.
10.	Scan QR tidak valid → tampil error yang jelas, tidak crash.
11.	Petugas mencoba akses endpoint admin → mendapat 403 Forbidden.
12.	Input nominal 0 → tersimpan sebagai kunjungan nihil, kas RT tidak berubah.
13.	Generate QR baru → QR lama tidak bisa digunakan, QR baru langsung aktif.
14.	Ekspor Excel 500+ baris → file terdownload dalam < 10 detik.

16. Roadmap Pengembangan
Versi	Target	Fitur Utama	Status
v1.0 — MVP	Q3 2026 (3 bulan)	Manajemen warga, QR scan, input transaksi, dashboard, ekspor Excel, multi-user 4 role, kas RT otomatis, PWA	In Development
v1.1 — Patch	Q3 2026 (+1 bulan)	Bug fixes, optimasi performa, bulk print QR PDF, filter & sort laporan, notifikasi in-app	Planned
v2.0 — Enhanced	Q4 2026 (6 bulan)	Peta Google Maps, sinkronisasi Google Sheets real-time, notifikasi WhatsApp, ekspor PDF laporan resmi, audit log UI	Planned
v2.1	Q1 2027	Multi-RT dalam satu instance, manajemen petugas per wilayah, laporan perbandingan antar RT	Planned
v3.0 — Scale	Q2 2027 (12 bulan)	Aplikasi Android native, OCR kamera untuk baca nominal, dashboard kelurahan/kecamatan, integrasi sistem administrasi desa	Concept

17. Analisis Risiko
ID	Risiko	Probabilitas	Dampak	Mitigasi
R01	Adopsi rendah oleh petugas yang tidak terbiasa teknologi	Sedang	Tinggi	Training langsung + video panduan + antarmuka ultra-simpel
R02	QR Code rusak atau hilang dari kotak jimpitan	Tinggi	Sedang	Generate ulang mudah + laminating QR saat cetak
R03	Koneksi internet tidak stabil saat ronde jimpitan	Sedang	Sedang	PWA offline mode untuk scan; sync saat online kembali
R04	Server down atau biaya VPS tidak terbayar	Rendah	Tinggi	Backup harian + dokumentasi restore + notifikasi tagihan
R05	Data warga bocor akibat celah keamanan	Rendah	Sangat Tinggi	HTTPS wajib, RBAC ketat, rate limiting, audit log, security test
R06	Konflik pengembangan antara backend dan frontend	Sedang	Sedang	API contract didefinisikan lebih dulu + mock server untuk FE

18. Glossary
Istilah	Definisi
Jimpitan	Tradisi iuran masyarakat RT/RW dengan nominal kecil yang dikumpulkan rutin (harian/mingguan) oleh petugas yang berkeliling ke setiap rumah.
QR Code	Quick Response Code — kode matriks 2D yang digunakan sebagai identifikasi unik setiap rumah warga dalam sistem.
PWA	Progressive Web App — aplikasi web yang dapat diinstall di smartphone dan mendukung mode offline layaknya aplikasi native.
RBAC	Role-Based Access Control — sistem otorisasi yang mengatur hak akses berdasarkan peran pengguna.
Kas RT	Buku kas keuangan RT yang mencatat seluruh pemasukan dan pengeluaran dana RT, termasuk dari jimpitan.
Rekap	Rangkuman data transaksi dalam periode tertentu (harian/mingguan/bulanan/tahunan).
Token Sanctum	Token autentikasi berbasis string yang dikeluarkan oleh Laravel Sanctum setelah login berhasil.
Petugas Jimpitan	Warga yang bertugas berkeliling mengambil uang jimpitan dan menginput data ke sistem.


Dokumen PRD ini bersifat living document — akan diperbarui seiring perkembangan proyek.
Jimpitan Desa Digital · versi 1.0 · Juni 2026
