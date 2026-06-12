"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { formatDateDDMMYYYY } from "@/lib/formatDate";

type KasEntry = {
  id: string;
  jenis: string;
  nominal: number;
  saldoAkhir: number;
  uraian: string;
  tanggal: string | null;
  createdAt: string | null;
  namaPetugas: string | null;
};

export default function KasKarangtarunaPage() {
  const [ledger, setLedger] = useState<KasEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ jenis: 'Masuk', nominal: '', uraian: '', tanggal: '' });
  const [filterWaktu, setFilterWaktu] = useState("Semua Waktu");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [sortTanggal, setSortTanggal] = useState<'none' | 'desc' | 'asc'>('none');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orgName, setOrgName] = useState("");
  const [petugasId, setPetugasId] = useState("");
  const [userRole, setUserRole] = useState("Anggota");
  const [searchQuery, setSearchQuery] = useState("");
  // ✅ FIX HIGH-1: Ref-based guard prevents double submission
  const savingRef = useRef(false);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/kas-karangtaruna');
    const data = await res.json();
    setLedger(data);
    setLoading(false);
  }, []);

  useEffect(() => { 
    fetchLedger(); 
    fetch('/api/pengaturan').then(r => r.json()).then(d => { if(d && d.namaOrganisasi) setOrgName(d.namaOrganisasi); }).catch(console.error);
    fetch('/api/auth/me').then(r => r.json()).then(d => { 
      if(d && d.user) {
        setPetugasId(d.user.id); 
        setUserRole(d.user.role);
      }
    }).catch(console.error);
  }, [fetchLedger]);

  const totalPemasukan = ledger.filter(e => e.jenis === 'Masuk').reduce((s, e) => s + e.nominal, 0);
  const totalPengeluaran = ledger.filter(e => e.jenis === 'Keluar').reduce((s, e) => s + e.nominal, 0);
  const saldoSekarang = totalPemasukan - totalPengeluaran;

  // Calculate dynamic running balance (always chronological by tanggal for correctness)
  const chronologicalLedger = [...ledger].sort((a, b) => {
    const dateA = new Date(a.tanggal || 0).getTime();
    const dateB = new Date(b.tanggal || 0).getTime();
    if (dateA === dateB) return a.id.localeCompare(b.id);
    return dateA - dateB;
  });

  let currentBalance = 0;
  const ledgerWithDynamicBalance = chronologicalLedger.map(item => {
    if (item.jenis === 'Masuk') {
      currentBalance += item.nominal;
    } else if (item.jenis === 'Keluar') {
      currentBalance -= item.nominal;
    }
    return { ...item, dynamicSaldo: currentBalance };
  });

  // Sort for display: default by createdAt (input time), or by tanggal if user toggled
  const displayLedger = [...ledgerWithDynamicBalance].sort((a, b) => {
    if (sortTanggal === 'none') {
      // Default: sort by createdAt descending (newest input first)
      const caA = new Date(a.createdAt || 0).getTime();
      const caB = new Date(b.createdAt || 0).getTime();
      if (caB === caA) return b.id.localeCompare(a.id);
      return caB - caA;
    } else {
      // Sort by tanggal (transaction date)
      const dateA = new Date(a.tanggal || 0).getTime();
      const dateB = new Date(b.tanggal || 0).getTime();
      if (dateA === dateB) return sortTanggal === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
      return sortTanggal === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  const cycleSortTanggal = () => {
    setSortTanggal(prev => {
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

  const handleSave = async () => {
    if (!form.nominal || !form.uraian || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      // POST /api/transaksi will automatically create the matching kas_karangtaruna entry

      // Also create matching transaksi
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nominal: parseInt(form.nominal),
          kategori: 'Kas Karangtaruna',
          jenis: form.jenis,
          uraian: form.uraian,
          petugasId: petugasId || undefined,
          tanggal: form.tanggal || undefined
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan transaksi.');
        return;
      }

      setShowModal(false);
      setForm({ jenis: 'Masuk', nominal: '', uraian: '', tanggal: '' });
      fetchLedger();
    } catch (e) {
      alert('Gagal menyimpan transaksi.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini? Penghapusan akan memengaruhi laporan.')) return;
    try {
      await fetch(`/api/kas-karangtaruna/${id}`, { method: 'DELETE' });
      fetchLedger();
    } catch (e) {
      alert('Gagal menghapus transaksi.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buku Kas Karangtaruna {orgName ? `(${orgName})` : ''}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Laporan arus kas utama organisasi {orgName ? `${orgName}` : ''}.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => {
              import('@/utils/exportToExcel').then(m => m.exportToExcel(ledger, 'Buku_Kas_Karangtaruna', 'Kas'));
            }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Unduh Excel
            </button>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Catat Transaksi
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Pemasukan</p>
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">+ Rp {totalPemasukan.toLocaleString('id-ID')}</h2>
          <button 
            onClick={() => setFilterJenis(filterJenis === 'Masuk' ? 'Semua' : 'Masuk')}
            className={`text-left text-xs transition-colors hover:underline ${filterJenis === 'Masuk' ? 'text-emerald-600 font-bold dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {filterJenis === 'Masuk' ? 'Batalkan filter (Tampilkan semua)' : `Dari ${ledger.filter(e => e.jenis === 'Masuk').length} entri (Klik untuk filter)`}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Pengeluaran</p>
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">- Rp {totalPengeluaran.toLocaleString('id-ID')}</h2>
          <button 
            onClick={() => setFilterJenis(filterJenis === 'Keluar' ? 'Semua' : 'Keluar')}
            className={`text-left text-xs transition-colors hover:underline ${filterJenis === 'Keluar' ? 'text-red-600 font-bold dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {filterJenis === 'Keluar' ? 'Batalkan filter (Tampilkan semua)' : `Dari ${ledger.filter(e => e.jenis === 'Keluar').length} entri (Klik untuk filter)`}
          </button>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-xl">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          <div className="relative z-10 mb-2">
            <p className="text-emerald-100 font-medium mb-1">Total Kas Keseluruhan</p>
            <h2 className="text-3xl font-bold tracking-tight">Rp {saldoSekarang.toLocaleString('id-ID')}</h2>
          </div>
          <div className="relative z-10">
            <button 
              onClick={() => setFilterJenis('Semua')}
              className={`text-left text-xs transition-colors hover:underline ${filterJenis === 'Semua' ? 'text-white font-bold' : 'text-emerald-100'}`}
            >
              {filterJenis === 'Semua' ? 'Menampilkan semua transaksi' : 'Klik untuk menampilkan semua transaksi'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Transaksi</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari uraian/nominal..." 
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
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={cycleSortTanggal} className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                      Tanggal
                      <span className="inline-flex flex-col leading-none">
                        <svg className={`w-2.5 h-2.5 ${sortTanggal === 'asc' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0z"/></svg>
                        <svg className={`w-2.5 h-2.5 ${sortTanggal === 'desc' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                      </span>
                      {sortTanggal === 'none' && <span className="text-[8px] sm:text-[9px] text-gray-400 font-normal normal-case">(input)</span>}
                    </button>
                  </th>
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uraian</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petugas</th>
                  {/* Mobile: single Nominal column */}
                  <th className="sm:hidden py-2 px-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
                  {/* Desktop: separate Pemasukan & Pengeluaran */}
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Pemasukan</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Pengeluaran</th>
                  {sortTanggal !== 'none' && (
                    <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Saldo Akhir</th>
                  )}
                  {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Bendahara') && (
                    <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {displayLedger.filter(item => {
                  if (filterJenis !== 'Semua' && item.jenis !== filterJenis) return false;
                  
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const uraian = item.uraian?.toLowerCase() || '';
                    const nominalStr = item.nominal?.toString() || '';
                    if (!uraian.includes(q) && !nominalStr.includes(q)) return false;
                  }

                  if (filterWaktu === "Semua Waktu") return true;
                  if (!item.tanggal) return false;
                  const d = new Date(item.tanggal);
                  const now = new Date();
                  if (filterWaktu === "Bulan Ini") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  if (filterWaktu === "Bulan Lalu") {
                    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
                  }
                  if (filterWaktu === "Tahun Ini") return d.getFullYear() === now.getFullYear();
                  if (filterWaktu === "Rentang Kustom") {
                    const trxDateStr = item.tanggal.slice(0, 10);
                    if (startDate && trxDateStr < startDate) return false;
                    if (endDate && trxDateStr > endDate) return false;
                    return true;
                  }
                  return true;
                }).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-2 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDateDDMMYYYY(item.tanggal)}</td>
                    <td className="py-2 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item.uraian}</td>
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item.namaPetugas || '-'}</td>
                    {/* Mobile: single Nominal column with color */}
                    <td className="sm:hidden py-2 px-3 text-right text-xs font-semibold whitespace-nowrap">
                      <span className={item.jenis === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {item.jenis === 'Masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    {/* Desktop: separate columns */}
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-right text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.jenis === 'Masuk' ? `Rp ${item.nominal.toLocaleString('id-ID')}` : <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>
                    <td className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-right text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.jenis === 'Keluar' ? `Rp ${item.nominal.toLocaleString('id-ID')}` : <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>
                    {sortTanggal !== 'none' && (
                      <td className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-right text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp {item.dynamicSaldo.toLocaleString('id-ID')}</td>
                    )}
                    {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Bendahara') && (
                      <td className="py-2 px-3 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                        <button title="Hapus" onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr><td colSpan={sortTanggal !== 'none' ? 6 : 5} className="py-8 text-center text-gray-400">Belum ada entri kas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Panel Laporan & Rekapitulasi</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lihat rekapitulasi data kas, cetak PDF, atau export ke Excel untuk pelaporan bulanan.</p>
        </div>
        <a href="/laporan" className="px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
          Lihat Laporan Lengkap
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </a>
      </div>

      {/* Modal Pencatatan Kas */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Catat Transaksi Kas</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Jenis Transaksi</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${form.jenis === 'Masuk' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <input type="radio" name="jenis" checked={form.jenis === 'Masuk'} onChange={() => setForm({ ...form, jenis: 'Masuk' })} className="text-emerald-600 focus:ring-emerald-500 mr-2" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Pemasukan</span>
                  </label>
                  <label className={`flex-1 border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${form.jenis === 'Keluar' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <input type="radio" name="jenis" checked={form.jenis === 'Keluar'} onChange={() => setForm({ ...form, jenis: 'Keluar' })} className="text-red-600 focus:ring-red-500 mr-2" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Pengeluaran</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal Transaksi</label>
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                  <input type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Uraian Keterangan</label>
                <textarea value={form.uraian} onChange={e => setForm({ ...form, uraian: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={3} placeholder="Contoh: Belanja keperluan rapat RT"></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.nominal || !form.uraian} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
