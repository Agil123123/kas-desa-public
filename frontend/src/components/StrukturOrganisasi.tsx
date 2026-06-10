type Anggota = {
  id: string;
  nama: string;
  jabatan: string;
};

export default function StrukturOrganisasi({ data = [], mode = "pejabat" }: { data?: Anggota[], mode?: "pejabat" | "deskripsi" }) {
  const getExactRole = (role: string) => {
    const matched = data.filter(a => a.jabatan.toLowerCase() === role.toLowerCase());
    if (matched.length === 0) return "Belum Ditugaskan";
    return matched.map(a => a.nama).join(" & ");
  };

  const descriptions: Record<string, string> = {
    "Ketua": "Bertanggung jawab atas seluruh kegiatan, mengambil keputusan strategis, dan memimpin organisasi.",
    "Wakil Ketua": "Membantu tugas ketua, menggantikan posisi saat berhalangan, dan mengawasi program kerja.",
    "Sekretaris": "Mengelola administrasi, surat-menyurat, arsip, dan notulensi rapat organisasi.",
    "Bendahara": "Mengelola dan mencatat sirkulasi keuangan (kas), serta menyusun laporan keuangan.",
    "Admin Sistem": "Mengelola konfigurasi sistem, data pengguna, hak akses, dan pengaturan aplikasi NawaPintar.",
    "Petugas Jimpitan": "Bertugas di lapangan untuk memindai QR code, menarik uang jimpitan dari warga, dan menyetor kas.",
  };

  const getDisplayValue = (role: string) => {
    return mode === "deskripsi" ? descriptions[role] : getExactRole(role);
  };

  return (
    <div className="py-4 w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">Jabatan Inti</th>
              <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {mode === "deskripsi" ? "Deskripsi Tugas" : "Pejabat"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">Ketua</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-bold">{getDisplayValue("Ketua")}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-emerald-500">Wakil Ketua</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-semibold">{getDisplayValue("Wakil Ketua")}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-blue-600 dark:text-blue-400">Sekretaris</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{getDisplayValue("Sekretaris")}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-blue-600 dark:text-blue-400">Bendahara</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{getDisplayValue("Bendahara")}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-amber-600 dark:text-amber-400">Admin Sistem</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{getDisplayValue("Admin Sistem")}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-amber-600 dark:text-amber-400">Petugas Jimpitan</td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{getDisplayValue("Petugas Jimpitan")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
