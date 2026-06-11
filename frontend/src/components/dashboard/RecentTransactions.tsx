"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';

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

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transaksi')
      .then(res => res.json())
      .then(data => {
        // limit 5
        setTransactions(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaksi Terakhir</h2>
        <Link href="/riwayat-transaksi" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium">Lihat Semua</Link>
      </div>
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat transaksi...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Anggota / Keterangan</th>
                <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((trx, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap">
                    <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{trx.kategori === 'Kas Jimpitan' ? (trx.namaWarga || 'Warga') : trx.uraian}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      <span className={`sm:hidden font-bold mr-1.5 ${trx.kategori === 'Kas Jimpitan' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                        {trx.kategori === 'Kas Jimpitan' ? 'JMP' : 'KAS'}
                      </span>
                      {trx.kategori === 'Kas Jimpitan' ? (trx.rtWarga ? `RT ${trx.rtWarga}` : 'Tanpa RT') : (trx.jenis === 'Masuk' ? 'Pemasukan' : 'Pengeluaran')}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md ${
                      trx.kategori === 'Kas Jimpitan' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {trx.kategori}
                    </span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{trx.tanggal?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap text-right">
                    <span className={trx.jenis === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {trx.jenis === 'Masuk' ? '+' : '-'} Rp {trx.nominal.toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400 text-sm">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
