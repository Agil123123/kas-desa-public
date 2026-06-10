export default function Personas() {
  const personas = [
    {
      role: "Admin",
      name: "Administrator",
      benefit: "Mengelola seluruh data sistem, menambahkan anggota baru, memantau pendaftaran dari frontend, dan mengevaluasi target keseluruhan.",
      color: "bg-blue-500"
    },
    {
      role: "Bendahara",
      name: "Bendahara",
      benefit: "Buku kas terupdate otomatis setiap ada jimpitan masuk. Akhir bulan tinggal klik tombol ekspor Excel untuk laporan rapat.",
      color: "bg-purple-500"
    },
    {
      role: "Petugas",
      name: "Petugas Keliling",
      benefit: "Tinggal scan QR code di rumah/kotak anggota, ketik nominal, simpan! Kurang dari 5 detik. Tidak pusing lagi bawa buku catatan.",
      color: "bg-emerald-500"
    },
    {
      role: "Anggota",
      name: "Anggota Karangtaruna",
      benefit: "Mendaftar mandiri via aplikasi, mendapatkan QR Code unik, dan memantau riwayat partisipasi jimpitan secara transparan.",
      color: "bg-orange-500"
    }
  ];

  return (
    <section id="pengguna" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Peran & Hak Akses Pengguna</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sistem kami membagi peran pengguna secara spesifik agar fungsi organisasi dapat berjalan secara efisien dan terkontrol.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {personas.map((persona, index) => (
            <div key={index} className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl transform opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-xl"></div>
              <div className="relative h-full bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${persona.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {persona.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{persona.name}</h3>
                <p className="text-emerald-500 dark:text-emerald-400 font-medium text-sm mb-4">{persona.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {persona.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
