"use client";
import { useState, useEffect, useCallback } from "react";

type Transaction = {
  id: string;
  noTransaksi: string;
  namaWarga: string | null;
  rtWarga: string | null;
  namaPetugas: string | null;
  tanggal: string;
  nominal: number;
  jenis: string | null;
  status: string | null;
};

export default function KasJimpitanPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWaktu, setFilterWaktu] = useState("Semua Waktu");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/transaksi?kategori=Kas Jimpitan');
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalMasuk = transactions.filter(t => t.jenis === 'Masuk').reduce((s, t) => s + t.nominal, 0);
  const totalKeluar = transactions.filter(t => t.jenis === 'Keluar').reduce((s, t) => s + t.nominal, 0);

  // Simple weekly/monthly approximation from current data
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const bulanIni = transactions.filter(t => t.tanggal.startsWith(monthPrefix) && t.jenis === 'Masuk');
  const mingguIni = transactions.filter(t => t.tanggal.slice(0, 10) >= weekAgo && t.jenis === 'Masuk');
  const totalBulan = bulanIni.reduce((s, t) => s + t.nominal, 0);
  const totalMinggu = mingguIni.reduce((s, t) => s + t.nominal, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Kas Jimpitan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Detail riwayat transaksi setoran jimpitan warga.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Terkumpul (Minggu Ini)</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Rp {totalMinggu.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Terkumpul (Bulan Ini)</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">Rp {totalBulan.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">Rp {totalKeluar.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Saldo Jimpitan</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Rp {(totalMasuk - totalKeluar).toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Transaksi</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{transactions.length} <span className="text-lg text-gray-500">trx</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Setoran</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm"
            />
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
                <option value="Rentang Kustom">Rentang Kustom</option>
              </select>
            </div>
            
            {filterWaktu === "Rentang Kustom" && (
              <div className="flex items-center gap-2 animate-fade-in-up w-full sm:w-auto">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
                <span className="text-gray-500">-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-gray-800">
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Trx</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Warga</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petugas</th>
                  {/* Mobile: single Nominal column */}
                  <th className="sm:hidden py-2 px-3 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
                  {/* Desktop: separate columns */}
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Pemasukan</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.filter(trx => {
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const noTrx = trx.noTransaksi?.toLowerCase() || '';
                    const nama = trx.namaWarga?.toLowerCase() || '';
                    const nominalStr = trx.nominal?.toString() || '';
                    if (!noTrx.includes(q) && !nama.includes(q) && !nominalStr.includes(q)) return false;
                  }
                  if (filterWaktu === "Semua Waktu") return true;
                  if (!trx.tanggal) return false;
                  const d = new Date(trx.tanggal);
                  const now = new Date();
                  if (filterWaktu === "Bulan Ini") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  if (filterWaktu === "Bulan Lalu") {
                    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
                  }
                  if (filterWaktu === "Tahun Ini") return d.getFullYear() === now.getFullYear();
                  if (filterWaktu === "Rentang Kustom") {
                    const trxDateStr = trx.tanggal.slice(0, 10);
                    if (startDate && trxDateStr < startDate) return false;
                    if (endDate && trxDateStr > endDate) return false;
                    return true;
                  }
                  return true;
                }).map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-mono text-gray-500">{trx.noTransaksi}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{trx.tanggal?.slice(0, 10) || '-'}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{trx.namaWarga || '-'} {trx.rtWarga ? <span className="text-[10px] sm:text-xs font-normal text-gray-500 ml-1">(RT {trx.rtWarga})</span> : null}</td>
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">{trx.namaPetugas || '-'}</td>
                    {/* Mobile: single Nominal column with color */}
                    <td className="sm:hidden py-2 px-3 text-right text-xs font-semibold whitespace-nowrap">
                      <span className={trx.jenis === 'Masuk' || !trx.jenis ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {trx.jenis === 'Masuk' || !trx.jenis ? '+' : '-'} Rp {trx.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    {/* Desktop: separate columns */}
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-right text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {trx.jenis === 'Masuk' || !trx.jenis ? `+ Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-right text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                      {trx.jenis === 'Keluar' ? `- Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada transaksi jimpitan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
