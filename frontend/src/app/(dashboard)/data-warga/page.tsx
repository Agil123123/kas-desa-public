"use client";
import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

type Warga = {
  id: string;
  kodeUnik: string;
  nik: string;
  namaKk: string;
  rt: string;
  rw: string;
  jimpitanMingguIni?: number;
  jimpitanBulanIni?: number;
};

type RtData = {
  id: string;
  nomor: string;
};

export default function DataWargaPage() {
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [rtList, setRtList] = useState<RtData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<Warga | null>(null);
  const [activeTab, setActiveTab] = useState("semua");
  const [form, setForm] = useState({ namaKk: '', nik: '', rt: '01', rw: '04' });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchWarga = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/warga');
    const data = await res.json();
    setWargaList(data);
    setLoading(false);
  }, []);

  const fetchRt = useCallback(async () => {
    const res = await fetch('/api/rt');
    const data = await res.json();
    setRtList(data);
  }, []);

  useEffect(() => { fetchWarga(); fetchRt(); }, [fetchWarga, fetchRt]);

  const filteredWarga = activeTab === "semua" ? wargaList : wargaList.filter(w => w.rt === activeTab);
  const uniqueRts = [...new Set(wargaList.map(w => w.rt))].sort();

  const openCreate = () => {
    setEditingId(null);
    setForm({ namaKk: '', nik: '', rt: rtList[0]?.nomor || '01', rw: '04' });
    setShowModal(true);
  };

  const openEdit = (w: Warga) => {
    setEditingId(w.id);
    setForm({ namaKk: w.namaKk, nik: w.nik, rt: w.rt, rw: w.rw });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/warga/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/warga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setShowSuccess(true);
      }
      setShowModal(false);
      fetchWarga();
    } catch (e) {
      alert('Gagal menyimpan data.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data warga ini?')) return;
    await fetch(`/api/warga/${id}`, { method: 'DELETE' });
    fetchWarga();
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_${qrModal?.namaKk.replace(/\s+/g, '_')}_RT${qrModal?.rt}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Warga (Peserta Jimpitan)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manajemen data rumah tangga peserta jimpitan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.open(`/data-warga/cetak-qr?rt=${activeTab}`, '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 print:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Cetak QR Massal
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 print:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Warga Baru
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 overflow-x-auto">
          <button onClick={() => setActiveTab("semua")} className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${activeTab === 'semua' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Semua Warga ({wargaList.length})</button>
          {(rtList.length > 0 ? rtList.map(r => r.nomor) : uniqueRts).map(rtNo => (
            <button key={rtNo} onClick={() => setActiveTab(rtNo)} className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${activeTab === rtNo ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>RT {rtNo}</button>
          ))}
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
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warga</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RT</th>
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jimpitan</th>
                  <th className="hidden md:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kode QR</th>
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredWarga.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-bold shadow-inner">
                          {item.namaKk.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{item.namaKk}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="sm:hidden font-medium text-emerald-600 dark:text-emerald-400">RT {item.rt}</span>
                            {item.nik && !item.nik.startsWith('NO-NIK') ? <span className="font-mono text-gray-400">{item.nik}</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-3 sm:py-4 sm:px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium text-xs">RT {item.rt}</span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp {(item.jimpitanMingguIni || 0).toLocaleString('id-ID')} <span className="text-[10px] text-gray-400 font-normal">/mg</span></span>
                        <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Rp {(item.jimpitanBulanIni || 0).toLocaleString('id-ID')} <span className="text-[10px] text-gray-400 font-normal">/bln</span></span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell py-3 px-3 sm:py-4 sm:px-6">
                      <button onClick={() => setQrModal(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-xs font-medium transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        {item.kodeUnik}
                      </button>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                       <div className="flex justify-end items-center gap-1">
                         <button title="Lihat QR" onClick={() => setQrModal(item)} className="md:hidden p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></button>
                         <Link href={`/data-warga/${item.id}`} title="Lihat Riwayat Jimpitan" className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
                         <button title="Edit" onClick={() => openEdit(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                         <button title="Hapus" onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredWarga.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada data warga.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Warga */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap / KK</label>
                <input type="text" value={form.namaKk} onChange={e => setForm({ ...form, namaKk: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Masukkan nama warga" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIK (Opsional)</label>
                <input type="text" value={form.nik.startsWith('NO-NIK') ? '' : form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Kosongkan jika tidak ada" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih RT</label>
                  <select value={form.rt} onChange={e => setForm({ ...form, rt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {rtList.map(r => <option key={r.id} value={r.nomor}>{r.nomor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RW</label>
                  <input type="text" value={form.rw} onChange={e => setForm({ ...form, rw: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="04" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.namaKk} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Menyimpan...' : editingId ? 'Update Data' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal QR Code */}
      {qrModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">QR Code Warga</h2>
              <button onClick={() => setQrModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-5 relative">
                <div className="absolute inset-0 border-2 border-dashed border-emerald-300 rounded-xl m-1 pointer-events-none"></div>
                <QRCodeSVG id="qr-code-svg" value={qrModal.kodeUnik} size={220} level="H" includeMargin={true} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">{qrModal.namaKk}</h3>
              <div className="flex gap-2 items-center">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-emerald-900/30 dark:text-emerald-400">RT {qrModal.rt}</span>
                <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">{qrModal.kodeUnik}</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={downloadQR} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download QR Code (SVG)
              </button>
              <button onClick={() => setQrModal(null)} className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors flex justify-center items-center gap-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up text-center p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-6">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Berhasil!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Data warga baru telah berhasil ditambahkan ke dalam sistem.</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
