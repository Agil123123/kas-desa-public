"use client";
import { useState, useEffect, useCallback } from "react";

type Transaksi = {
  id: string;
  namaWarga: string | null;
  rtWarga: string | null;
  namaPetugas: string | null;
  kategori: string;
  nominal: number;
  tanggal: string | null;
  status: string;
  jenis: string;
  uraian: string;
};

export default function RiwayatTransaksiPage() {
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWaktu, setFilterWaktu] = useState("Semua Waktu");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userRole, setUserRole] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/transaksi');
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d?.user?.role) setUserRole(d.user.role); }).catch(() => {});
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/transaksi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus transaksi');
      }
    } catch {
      alert('Gagal menghapus transaksi');
    }
    setDeleting(null);
  };

  // Filter Logic
  // ✅ FIX MEDIUM-3: Search filter now applies to ALL views, not just when time filter is active
  const getFilteredData = () => {
    return transactions.filter(trx => {
      // Apply search filter FIRST (always, regardless of time filter)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nama = trx.namaWarga?.toLowerCase() || '';
        const uraian = trx.uraian?.toLowerCase() || '';
        const kategori = trx.kategori?.toLowerCase() || '';
        const nominalStr = trx.nominal?.toString() || '';
        if (!nama.includes(q) && !uraian.includes(q) && !kategori.includes(q) && !nominalStr.includes(q)) {
          return false;
        }
      }

      // Then apply time filter
      if (filterWaktu === "Semua Waktu") return true;

      if (!trx.tanggal) return false;
      const trxDate = new Date(trx.tanggal);
      const now = new Date();

      if (filterWaktu === "Bulan Ini") {
        return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
      }
      if (filterWaktu === "Bulan Lalu") {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return trxDate.getMonth() === lastMonthDate.getMonth() && trxDate.getFullYear() === lastMonthDate.getFullYear();
      }
      if (filterWaktu === "Tahun Ini") {
        return trxDate.getFullYear() === now.getFullYear();
      }
      if (filterWaktu === "Rentang Kustom") {
        const trxDateStr = trx.tanggal.slice(0, 10);
        if (startDate && trxDateStr < startDate) return false;
        if (endDate && trxDateStr > endDate) return false;
      }

      return true;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Riwayat Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Daftar lengkap transaksi Kas Jimpitan & Kas Karangtaruna.</p>
        </div>
        
        {/* Filter Waktu */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter:</label>
              <select 
                value={filterWaktu}
                onChange={(e) => setFilterWaktu(e.target.value)}
                className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm min-w-0"
              >
                <option value="Semua Waktu">Semua Waktu</option>
                <option value="Bulan Ini">Bulan Ini</option>
                <option value="Bulan Lalu">Bulan Lalu</option>
                <option value="Tahun Ini">Tahun Ini</option>
                <option value="Rentang Kustom">Rentang Kustom (Kalender)</option>
              </select>
            </div>
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm"
            />
            <button onClick={() => {
              import('@/utils/exportToExcel').then(m => m.exportToExcel(filteredData, 'Riwayat_Transaksi', 'Transaksi'));
            }} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Unduh Excel
            </button>
          </div>
          
          {filterWaktu === "Rentang Kustom" && (
            <div className="flex items-center gap-2 w-full sm:w-auto animate-fade-in-up">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
              <span className="text-gray-500">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal & Waktu</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Anggota / Uraian</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nominal</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petugas</th>
                  {userRole === 'Super Admin' && <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((trx, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{trx.tanggal}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {trx.kategori === 'Kas Jimpitan' ? (trx.namaWarga || 'Warga') : trx.uraian}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trx.kategori === 'Kas Jimpitan' ? (trx.rtWarga ? `RT ${trx.rtWarga}` : 'Tanpa RT') : (trx.jenis === 'Masuk' ? 'Pemasukan' : 'Pengeluaran')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        trx.kategori === 'Kas Jimpitan' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {trx.kategori}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium whitespace-nowrap">
                      <span className={trx.jenis === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {trx.jenis === 'Masuk' ? '+' : '-'} Rp {trx.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{trx.namaPetugas || '-'}</td>
                    {userRole === 'Super Admin' && (
                      <td className="py-4 px-6 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(trx.id)}
                          disabled={deleting === trx.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {deleting === trx.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr><td colSpan={userRole === 'Super Admin' ? 6 : 5} className="py-8 text-center text-gray-400">Tidak ada transaksi untuk periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
