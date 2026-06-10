export default function StrukturOrganisasi() {
  const structure = [
    { no: 1, jabatan: "Ketua", tugas: "Memimpin dan bertanggung jawab penuh atas jalannya organisasi Karangtaruna." },
    { no: 2, jabatan: "Wakil Ketua", tugas: "Membantu tugas ketua dan menggantikan saat ketua berhalangan." },
    { no: 3, jabatan: "Sekretaris", tugas: "Mengurus administrasi, surat menyurat, dan pendataan keanggotaan." },
    { no: 4, jabatan: "Bendahara", tugas: "Mengelola keuangan, termasuk rekapan uang jimpitan dan pelaporan kas." },
    { no: 5, jabatan: "Admin Sistem", tugas: "Mengelola aplikasi digital, manajemen pengguna, dan verifikasi anggota baru." },
    { no: 6, jabatan: "Petugas Jimpitan", tugas: "Berkeliling menarik jimpitan dan memindai QR Code menggunakan aplikasi." },
    { no: 7, jabatan: "Anggota", tugas: "Berpartisipasi aktif dalam kegiatan Karangtaruna dan menyetorkan jimpitan." },
  ];

  return (
    <section id="organisasi" className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Struktur Organisasi Karangtaruna</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pembagian tugas dan tanggung jawab untuk menjalankan program kerja dan manajemen keuangan yang transparan.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="py-4 px-6 text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Jabatan</th>
                  <th className="py-4 px-6 text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Tugas Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {structure.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-300 text-center">{item.no}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{item.jabatan}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.tugas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
