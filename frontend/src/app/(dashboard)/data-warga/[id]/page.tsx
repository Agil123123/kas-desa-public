"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function DetailWargaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [warga, setWarga] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/warga/${id}/riwayat`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/data-warga');
          return;
        }
        throw new Error('Gagal mengambil data');
      }
      const data = await res.json();
      setWarga(data.warga);
      setRiwayat(data.riwayat);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }

  if (!warga) return null;

  const filteredRiwayat = riwayat.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const noTrx = item.noTransaksi?.toLowerCase() || '';
    const nominalStr = item.nominal?.toString() || '';
    const dateStr = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase() : '';
    return noTrx.includes(q) || nominalStr.includes(q) || dateStr.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/data-warga" className="p-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Riwayat Warga</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Riwayat pembayaran jimpitan khusus untuk warga ini.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="h-20 w-20 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-2xl font-bold shadow-inner">
          {warga.namaKk.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{warga.namaKk}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg font-medium text-xs border border-emerald-100 dark:border-emerald-800">
              RT {warga.rt} / RW {warga.rw}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-mono text-xs border border-gray-200 dark:border-gray-600">
              {warga.kodeUnik}
            </span>
            {warga.nik && !warga.nik.startsWith('NO-NIK') && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-mono text-xs border border-blue-100 dark:border-blue-800">
                NIK: {warga.nik}
              </span>
            )}
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-gray-900/50 p-4 rounded-xl text-center min-w-[150px] border border-emerald-100 dark:border-gray-700 z-10">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Setoran Tercatat</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{riwayat.length} Kali</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Riwayat Setoran Jimpitan
          </h3>
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-48"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomor Transaksi</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nominal</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRiwayat.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">
                    <div className="font-medium">{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                    <div className="text-xs text-gray-500">{item.tanggal ? new Date(item.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-gray-500 dark:text-gray-400">{item.noTransaksi}</td>
                  <td className="py-3 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp {item.nominal.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-sm">
                    {item.status === 'Success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Berhasil
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRiwayat.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    <p>Warga ini belum memiliki riwayat setoran jimpitan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
