"use client";
import { useState, useEffect, useCallback } from "react";
import * as XLSX from 'xlsx';

type KasEntry = {
  id: string;
  jenis: string;
  nominal: number;
  saldoAkhir: number;
  uraian: string;
  tanggal: string | null;
  namaPetugas: string | null;
};

export default function LaporanPage() {
  const [activeReport, setActiveReport] = useState("jimpitan");
  const [isExporting, setIsExporting] = useState(false);
  
  // Kas Karangtaruna State
  const [ledger, setLedger] = useState<KasEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rekapRT, setRekapRT] = useState<any[]>([]);
  const [totalJimpitan, setTotalJimpitan] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Warga Report State
  const [reportMonth, setReportMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [wargaReport, setWargaReport] = useState<any>(null);
  const [wargaLoading, setWargaLoading] = useState(false);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kas-karangtaruna');
      const data = await res.json();
      setLedger(data);

      const resDashboard = await fetch('/api/dashboard');
      let jimpitanRtMap: Record<string, number> = {};
      let wargaRtMap: Record<string, number> = {};
      let targetPerKk = 30000;
      
      if (resDashboard.ok) {
        const dData = await resDashboard.json();
        setDashboardData(dData);
        setTotalJimpitan(dData.totalJimpitanKeseluruhan || 0);
        targetPerKk = dData.targetPerKk || 30000;
        
        if (dData.jimpitanPerRt) {
          dData.jimpitanPerRt.forEach((item: any) => {
            jimpitanRtMap[item.rt] = item.total;
          });
        }
        if (dData.wargaPerRt) {
          dData.wargaPerRt.forEach((item: any) => {
            wargaRtMap[item.rt] = item.count;
          });
        }
      }

      const resRt = await fetch('/api/rt');
      if (resRt.ok) {
        const dataRt = await resRt.json();
        const formattedRt = dataRt.map((rt: any) => {
          const terkumpul = jimpitanRtMap[rt.nomor] || 0;
          const jumlahWarga = wargaRtMap[rt.nomor] || 0;
          // Target is dynamic: target per KK (or Warga) multiplied by actual registered Warga count
          // Fallback to rt.jumlahKk if no Warga is registered yet to avoid 0 target, or just 0
          const validCount = jumlahWarga > 0 ? jumlahWarga : (rt.jumlahKk || 0);
          const target = validCount * targetPerKk;
          
          const persentase = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
          const participantCount = targetPerKk > 0 ? Math.ceil(terkumpul / targetPerKk) : 0;
          
          return {
            rt: rt.nomor,
            target: target,
            terkumpul: terkumpul,
            persentase: persentase,
            partisipasi: `${participantCount}/${validCount}`
          };
        });
        setRekapRT(formattedRt);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const fetchWargaReport = useCallback(async () => {
    if (activeReport !== 'warga') return;
    setWargaLoading(true);
    try {
      const res = await fetch(`/api/laporan/warga-bulanan?month=${reportMonth}&year=${reportYear}`);
      const data = await res.json();
      setWargaReport(data);
    } catch (err) {
      console.error(err);
    }
    setWargaLoading(false);
  }, [activeReport, reportMonth, reportYear]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);
  useEffect(() => { fetchWargaReport(); }, [fetchWargaReport]);

  // Filter ledger based on dates
  const filteredLedger = ledger.filter(item => {
    if (!item.tanggal) return true;
    const trxDate = item.tanggal.slice(0, 10);
    if (startDate && trxDate < startDate) return false;
    if (endDate && trxDate > endDate) return false;
    
    if (searchQuery) {
       const q = searchQuery.toLowerCase();
       const uraian = item.uraian?.toLowerCase() || '';
       const jenis = item.jenis?.toLowerCase() || '';
       const nominalStr = item.nominal?.toString() || '';
       if (!uraian.includes(q) && !jenis.includes(q) && !nominalStr.includes(q)) return false;
    }
    
    return true;
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const wb = XLSX.utils.book_new();

        if (activeReport === 'jimpitan') {
          // Format data for Excel
          const data = rekapRT.map(rt => ({
            'Lingkungan RT': `RT ${rt.rt}`,
            'Target Capaian (Rp)': rt.target,
            'Terkumpul (Rp)': rt.terkumpul,
            'Persentase Capaian (%)': rt.persentase,
            'Partisipasi Warga': rt.partisipasi
          }));
          
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, "Laporan Jimpitan");
        } else if (activeReport === 'karangtaruna') {
          // Format data for Kas Karangtaruna Excel
          const data = filteredLedger.map(item => ({
            'Tanggal': item.tanggal ? item.tanggal.slice(0, 10) : '-',
            'Jenis Transaksi': item.jenis,
            'Nominal (Rp)': item.nominal,
            'Uraian': item.uraian,
            'Petugas': item.namaPetugas || '-',
            'Saldo Akhir (Rp)': item.saldoAkhir
          }));

          const ws = XLSX.utils.json_to_sheet(data);
          
          // Add column widths
          ws['!cols'] = [
            { wch: 12 }, // Tanggal
            { wch: 15 }, // Jenis
            { wch: 15 }, // Nominal
            { wch: 40 }, // Uraian
            { wch: 20 }, // Petugas
            { wch: 20 }, // Saldo Akhir
          ];

          XLSX.utils.book_append_sheet(wb, ws, "Riwayat Transaksi Kas");
        } else if (activeReport === 'warga') {
          if (!wargaReport) return;
          const headers = ['Nama Warga', 'RT', 'RW'];
          for(let i=1; i<=wargaReport.jumlahMinggu; i++) headers.push(`Minggu ${i}`);
          
          const data = wargaReport.data.map((w: any) => {
             const row: any = { 'Nama Warga': w.nama, 'RT': w.rt, 'RW': w.rw };
             w.minggu.forEach((m: any) => {
                row[`Minggu ${m.mingguKe}`] = m.status === 'Sudah' ? `Sudah (Rp ${m.nominal})` : 'Belum';
             });
             return row;
          });
          const ws = XLSX.utils.json_to_sheet(data, { header: headers });
          XLSX.utils.book_append_sheet(wb, ws, "Laporan Mingguan Warga");
        }

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `Laporan_${activeReport}_${new Date().toISOString().slice(0,10)}.xlsx`);
      } catch (err) {
        console.error("Export error:", err);
        alert("Terjadi kesalahan saat mengekspor laporan.");
      }
      setIsExporting(false);
    }, 500);
  };


  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan & Rekapitulasi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Unduh laporan pemasukan, pengeluaran, dan capaian target.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
            Kirim ke G-Sheets
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            )}
            Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-max mb-6 gap-1">
        <button 
          onClick={() => setActiveReport("jimpitan")} 
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap text-center sm:text-left ${activeReport === 'jimpitan' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          Laporan Jimpitan
        </button>
        <button 
          onClick={() => setActiveReport("karangtaruna")} 
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap text-center sm:text-left ${activeReport === 'karangtaruna' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          Laporan Kas Karangtaruna
        </button>
        <button 
          onClick={() => setActiveReport("warga")} 
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap text-center sm:text-left ${activeReport === 'warga' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          Laporan Mingguan Warga
        </button>
      </div>

      {activeReport === "jimpitan" && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-1">Total Saldo Jimpitan Saat Ini</p>
              <h2 className="text-4xl font-bold tracking-tight">Rp {loading ? "..." : totalJimpitan.toLocaleString('id-ID')}</h2>
            </div>
            <div className="relative z-10 bg-white/10 p-4 rounded-xl hidden md:block border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pemasukan Mingguan</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+ Rp {loading ? '...' : (dashboardData?.jimpitanStats?.week || 0).toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pemasukan Bulanan</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+ Rp {loading ? '...' : (dashboardData?.jimpitanStats?.month || 0).toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran Kas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">- Rp 0</p>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h2 className="font-semibold text-gray-900 dark:text-white">Performa Target Jimpitan Lingkungan (Juni 2026)</h2>
              <select className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-emerald-500">
                <option>Juni 2026</option>
                <option>Mei 2026</option>
                <option>April 2026</option>
              </select>
            </div>
            
            <div className="overflow-x-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rekapRT.map((rt, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Lingkungan</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">RT 0{rt.rt}</h3>
                      </div>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">
                        {rt.partisipasi} KK Aktif
                      </span>
                    </div>
                    
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-500">Terkumpul: <strong className="text-gray-900 dark:text-white">Rp {rt.terkumpul.toLocaleString('id-ID')}</strong></span>
                      <span className="text-gray-500">Target: Rp {rt.target.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                      <div className={`h-2.5 rounded-full ${rt.persentase >= 100 ? 'bg-emerald-500' : rt.persentase > 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${rt.persentase}%` }}></div>
                    </div>
                    <p className="text-right text-xs font-bold text-gray-600 dark:text-gray-400">{rt.persentase}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === "karangtaruna" && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-1">Total Saldo Kas Karangtaruna Saat Ini</p>
              <h2 className="text-4xl font-bold tracking-tight">
                {loading ? 'Memuat...' : `Rp ${(ledger.length > 0 ? ledger[0].saldoAkhir : 0).toLocaleString('id-ID')}`}
              </h2>
            </div>
            <div className="relative z-10 bg-white/10 p-4 rounded-xl hidden md:block border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pemasukan Mingguan</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+ Rp {loading ? '...' : (dashboardData?.kasMasukStats?.week || 0).toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pemasukan Bulanan</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+ Rp {loading ? '...' : (dashboardData?.kasMasukStats?.month || 0).toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pengeluaran Bulanan</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">- Rp {loading ? '...' : (dashboardData?.kasKeluarStats?.month || 0).toLocaleString('id-ID')}</p>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
               <div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Filter transaksi berdasarkan rentang tanggal.</p>
               </div>
               <div className="flex flex-wrap items-center gap-3">
                 <div>
                   <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari</label>
                   <input type="text" placeholder="Kata kunci..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-48" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Mulai</label>
                   <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
                 <span className="text-gray-400 mt-5">-</span>
                 <div>
                   <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Selesai</label>
                   <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
                 {(startDate || endDate || searchQuery) && (
                   <button onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }} className="mt-5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Reset</button>
                 )}
               </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-emerald-500"><svg className="w-8 h-8 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700">Waktu</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700">Uraian</th>
                      {/* Mobile Nominal */}
                      <th className="sm:hidden py-2 px-3 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 text-right">Nominal</th>
                      {/* Desktop Masuk/Keluar */}
                      <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 text-right">Masuk</th>
                      <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 text-right">Keluar</th>
                      <th className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 text-right">Saldo Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-2 px-3 sm:py-3 sm:px-4 text-[10px] sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.tanggal ? item.tanggal.slice(0, 10) : '-'}</td>
                        <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item.uraian}</td>
                        {/* Mobile Nominal */}
                        <td className="sm:hidden py-2 px-3 text-right text-[10px] font-semibold whitespace-nowrap">
                          <span className={item.jenis === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {item.jenis === 'Masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </td>
                        {/* Desktop Masuk/Keluar */}
                        <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-right text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {item.jenis === 'Masuk' ? `+ Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-right text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                          {item.jenis === 'Keluar' ? `- Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="hidden sm:table-cell py-2 px-3 sm:py-3 sm:px-4 text-right text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp {item.saldoAkhir.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    {filteredLedger.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                          {ledger.length === 0 ? 'Belum ada data riwayat transaksi kas.' : 'Tidak ada transaksi pada rentang waktu tersebut.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeReport === "warga" && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Laporan Setoran Mingguan Warga</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pantau status pembayaran jimpitan warga pada setiap minggu di bulan tertentu.</p>
              </div>
              <div className="flex gap-2">
                <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm focus:ring-emerald-500">
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
                <select value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm focus:ring-emerald-500">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto p-0">
              {wargaLoading ? (
                <div className="py-12 text-center text-emerald-500"><svg className="w-8 h-8 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>
              ) : wargaReport ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-gray-800 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#374151]">Warga</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 text-center">RT</th>
                      {Array.from({ length: wargaReport.jumlahMinggu }).map((_, i) => (
                        <th key={i} className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-r border-gray-200 dark:border-gray-700">Minggu {i+1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {wargaReport.data.map((w: any) => (
                      <tr key={w.wargaId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#374151]">
                          {w.nama}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                          {w.rt}
                        </td>
                        {w.minggu.slice(0, wargaReport.jumlahMinggu).map((m: any) => (
                          <td key={m.mingguKe} className="py-3 px-4 text-center border-r border-gray-200 dark:border-gray-700">
                            {m.status === 'Sudah' ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-0.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Rp {m.nominal.toLocaleString('id-ID')}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500" title="Belum Setor">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {wargaReport.data.length === 0 && (
                      <tr>
                        <td colSpan={wargaReport.jumlahMinggu + 2} className="py-12 text-center text-gray-500">
                          Tidak ada data warga atau transaksi pada bulan ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
