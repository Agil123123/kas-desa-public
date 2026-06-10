"use client";
import { useState, useEffect, useCallback } from "react";

type KasEntry = {
  id: string;
  jenis: string;
  nominal: number;
  saldoAkhir: number;
  uraian: string;
  tanggal: string | null;
  namaPetugas: string | null;
};

export default function KasKarangtarunaPage() {
  const [ledger, setLedger] = useState<KasEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ jenis: 'Masuk', nominal: '', uraian: '', tanggal: '' });
  const [filterWaktu, setFilterWaktu] = useState("Semua Waktu");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orgName, setOrgName] = useState("");
  const [petugasId, setPetugasId] = useState("");

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
    fetch('/api/auth/me').then(r => r.json()).then(d => { if(d && d.user) setPetugasId(d.user.id); }).catch(console.error);
  }, [fetchLedger]);

  const saldoSekarang = ledger.length > 0 ? ledger[0].saldoAkhir : 0;
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const masukBulanIni = ledger.filter(e => e.jenis === 'Masuk' && e.tanggal?.startsWith(monthPrefix)).reduce((s, e) => s + e.nominal, 0);

  const handleSave = async () => {
    if (!form.nominal || !form.uraian) return;
    setSaving(true);
    try {
      // Create kas_rt entry
      await fetch('/api/kas-karangtaruna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: form.jenis,
          nominal: parseInt(form.nominal),
          uraian: form.uraian,
          tanggal: form.tanggal || undefined
        }),
      });

      // Also create matching transaksi
      await fetch('/api/transaksi', {
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

      setShowModal(false);
      setForm({ jenis: 'Masuk', nominal: '', uraian: '' });
      fetchLedger();
    } catch (e) {
      alert('Gagal menyimpan transaksi.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buku Kas Karangtaruna {orgName ? `(${orgName})` : ''}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Laporan arus kas utama organisasi {orgName ? `${orgName}` : ''}.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-3">
            <select 
              value={filterWaktu}
              onChange={(e) => setFilterWaktu(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm"
            >
              <option value="Semua Waktu">Semua Waktu</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Bulan Lalu">Bulan Lalu</option>
              <option value="Tahun Ini">Tahun Ini</option>
              <option value="Rentang Kustom">Rentang Kustom</option>
            </select>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Catat Transaksi Baru
            </button>
          </div>
          
          {filterWaktu === "Rentang Kustom" && (
            <div className="flex items-center gap-2 animate-fade-in-up mt-2 sm:mt-0">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
              <span className="text-gray-500">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          <div className="relative z-10 mb-4">
            <p className="text-emerald-100 font-medium mb-1">Total Kas Karangtaruna Keseluruhan</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Rp {saldoSekarang.toLocaleString('id-ID')}</h2>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm">Data realtime dari database</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8 flex flex-col justify-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Saldo (Masuk) Bulan Ini</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">+ Rp {masukBulanIni.toLocaleString('id-ID')}</h2>
          <p className="text-sm text-gray-500">{ledger.length} entri total</p>
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
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uraian Keterangan</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petugas</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Masuk (Debit)</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Keluar (Kredit)</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ledger.filter(item => {
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
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.tanggal}</td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{item.uraian}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{item.namaPetugas || '-'}</td>
                    <td className="py-4 px-6 text-right font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.jenis === 'Masuk' ? `Rp ${item.nominal.toLocaleString('id-ID')}` : <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.jenis === 'Keluar' ? `Rp ${item.nominal.toLocaleString('id-ID')}` : <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp {item.saldoAkhir.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada entri kas.</td></tr>
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
