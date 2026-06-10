import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KebijakanPrivasi() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans selection:bg-emerald-500/30">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Kebijakan Privasi</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 prose prose-emerald dark:prose-invert max-w-none">
          <p>
            Selamat datang di Sistem Informasi NawaPintar. Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan memproses informasi pribadi Anda saat menggunakan layanan dan situs web NawaPintar.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h3>
          <p>Kami dapat mengumpulkan jenis informasi berikut saat Anda berinteraksi dengan sistem NawaPintar:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li><strong>Data Profil Pengguna:</strong> Nama lengkap, alamat email, dan kata sandi yang Anda berikan saat pendaftaran.</li>
            <li><strong>Data Warga:</strong> Nomor Induk Kependudukan (NIK), nama Kepala Keluarga (KK), alamat (RT/RW), dan riwayat penyetoran kas jimpitan.</li>
            <li><strong>Data Transaksi:</strong> Nominal, tanggal, dan waktu pembayaran jimpitan yang terekam lewat aplikasi atau pindaian QR Code.</li>
            <li><strong>Data Penggunaan Otomatis:</strong> Alamat IP, jenis peramban (*browser*), serta riwayat log aktivitas yang berkaitan dengan akses aplikasi.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h3>
          <p>Data yang dikumpulkan akan kami gunakan secara ketat hanya untuk:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            <li>Memfasilitasi dan mengelola pencatatan dana jimpitan serta pembukuan kas karangtaruna.</li>
            <li>Mengidentifikasi pengguna yang berhak mendapatkan akses ke dasbor sistem.</li>
            <li>Memberikan laporan keuangan yang akurat, transparan, dan dapat dipertanggungjawabkan kepada pengurus dan warga terkait.</li>
            <li>Mengirimkan pemberitahuan penting terkait perubahan layanan atau pembaruan sistem.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Perlindungan & Keamanan Data</h3>
          <p>
            Kami menerapkan berbagai langkah keamanan teknis dan administratif yang standar untuk melindungi informasi pribadi Anda dari akses yang tidak sah, pengungkapan, perubahan, atau penghancuran. Kata sandi dienkripsi, dan hak akses dikontrol ketat oleh struktur *Role-Based Access Control* (Super Admin, Admin, Petugas). Namun demikian, kami mengingatkan bahwa tidak ada transmisi data melalui internet yang sepenuhnya aman 100%.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Berbagi Informasi Pihak Ketiga</h3>
          <p>
            Kami **tidak** menjual, menyewakan, atau memperdagangkan informasi pribadi atau data keuangan warga kepada pihak ketiga mana pun. Data dapat dibagikan atau disinkronisasikan (seperti ke *Google Sheets*) semata-mata untuk tujuan pelaporan internal atas persetujuan atau konfigurasi yang dilakukan oleh Super Admin.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Hak Akses & Penghapusan Data</h3>
          <p>
            Jika Anda merupakan warga terdaftar atau pemilik akun dan ingin mengakses, memperbarui, atau meminta penghapusan informasi pribadi Anda dari *database* NawaPintar, silakan sampaikan permohonan tersebut secara langsung kepada Pengurus RT atau Super Admin melalui halaman Kontak.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Perubahan Kebijakan Privasi</h3>
          <p>
            Kami berhak untuk mengubah atau memperbarui Kebijakan Privasi ini kapan saja untuk mencerminkan penyesuaian layanan atau regulasi yang berlaku. Kami sangat menyarankan agar Anda meninjau halaman ini secara berkala.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Hubungi Kami</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Jika Anda memiliki pertanyaan, keluhan, atau saran mengenai Kebijakan Privasi ini, silakan hubungi kami di:
            <br />
            <strong>Email:</strong> agilardhy69@gmail.com / kartar@nawasena.id
            <br />
            <strong>WhatsApp:</strong> 081326036344
          </p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
