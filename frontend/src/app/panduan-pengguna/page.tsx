import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PanduanPengguna() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans selection:bg-emerald-500/30">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Panduan Pengguna</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Selamat datang di panduan resmi NawaPintar. Berikut adalah panduan singkat untuk membantu Anda menggunakan sistem ini dengan maksimal.
        </p>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Cara Mendaftar dan Mendapatkan Akses</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Pilih menu <strong>Login Sistem</strong> di pojok kanan atas, lalu klik <strong>Daftar Akun Baru</strong>.</li>
              <li>Isi nama lengkap, alamat email yang sesuai, dan kata sandi yang aman.</li>
              <li>Pastikan email Anda menggunakan domain yang telah diizinkan oleh sistem (seperti <em>@gmail.com</em> atau <em>@nawapintar.com</em>).</li>
              <li>Setelah mendaftar, akun Anda akan berstatus <strong>Pending</strong>. Harap hubungi pengurus RT atau Admin Sistem agar akun Anda segera diaktifkan.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Menambah & Mengelola Anggota/Warga</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Masuk menggunakan akun <strong>Super Admin</strong> atau <strong>Admin</strong>.</li>
              <li>Pilih menu <strong>Anggota Karangtaruna</strong> atau <strong>Data Warga</strong> di bilah navigasi samping (Sidebar).</li>
              <li>Klik tombol <strong>Tambah Data</strong>, dan isi detail NIK, Nama, serta alamat (RT/RW).</li>
              <li>Sistem akan otomatis menerbitkan <strong>QR Code</strong> unik untuk warga tersebut yang bisa dicetak untuk ditempel di kotak jimpitan.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Melakukan Pencatatan Transaksi Jimpitan</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Pilih menu <strong>Input Transaksi</strong> di dasbor.</li>
              <li>Untuk mempercepat pencatatan, gunakan kamera perangkat Anda untuk memindai <strong>QR Code</strong> yang terpasang di kotak warga.</li>
              <li>Jika fitur pemindai bermasalah, Anda juga dapat menginput secara manual melalui opsi <strong>Input Manual</strong>.</li>
              <li>Sistem otomatis akan mencatat nama Petugas yang menginput transaksi.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Melihat Laporan & Buku Kas</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Menu <strong>Buku Kas Karangtaruna</strong> menyajikan laporan terintegrasi dan transparan secara *real-time*.</li>
              <li>Anda dapat melihat <strong>Pemasukan Mingguan & Bulanan</strong> serta daftar rincian <strong>Pengeluaran</strong>.</li>
              <li>Gunakan fitur <em>Filter</em> untuk menampilkan data pada bulan atau minggu tertentu sesuai kebutuhan evaluasi Anda.</li>
            </ul>
          </section>
        </div>
        
        <div className="mt-12 text-center text-gray-500">
          <p>Butuh bantuan lebih lanjut? Hubungi dukungan kami melalui informasi kontak di bagian Footer.</p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
