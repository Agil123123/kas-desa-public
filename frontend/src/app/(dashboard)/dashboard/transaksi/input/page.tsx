"use client";
import { useState, useEffect, useCallback } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';

type WargaItem = { id: string; namaKk: string; rt: string; kodeUnik: string };

export default function InputTransaksiPage() {
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [wargaList, setWargaList] = useState<WargaItem[]>([]);
  const [form, setForm] = useState({ jenisTrx: 'Masuk', wargaId: '', nominal: '5000', uraian: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [petugasId, setPetugasId] = useState("");

  const fetchWarga = useCallback(async () => {
    const res = await fetch('/api/warga');
    const data = await res.json();
    setWargaList(data);
  }, []);

  useEffect(() => { 
    fetchWarga(); 
    fetch('/api/auth/me').then(r => r.json()).then(d => { if(d && d.user) setPetugasId(d.user.id); }).catch(console.error);
  }, [fetchWarga]);

  const handleSubmit = async () => {
    if (!form.nominal) return;
    setSaving(true);
    setSuccess(false);
    try {
      await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wargaId: form.wargaId || null,
          nominal: parseInt(form.nominal),
          kategori: 'Kas Jimpitan',
          jenis: form.jenisTrx,
          uraian: form.uraian || `Setoran jimpitan ${form.jenisTrx === 'Masuk' ? 'harian' : ''}`,
          petugasId: petugasId || undefined,
        }),
      });
      setSuccess(true);
      setForm({ jenisTrx: 'Masuk', wargaId: '', nominal: '5000', uraian: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Gagal menyimpan transaksi.');
    }
    setSaving(false);
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    const text = detectedCodes[0].rawValue;
    
    // Avoid double scanning within a short time (handled by switching modes)
    if (mode !== "scan") return;

    const found = wargaList.find(w => w.kodeUnik === text);
    if (found) {
      playBeep();
      setForm(prev => ({ ...prev, wargaId: found.id }));
      setMode("manual");
    } else {
      alert("QR Code tidak dikenali. Pastikan ini adalah QR warga yang terdaftar.");
    }
  };

  const presets = [2000, 5000, 10000];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pencatatan Jimpitan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gunakan kamera untuk memindai QR warga, atau catat secara manual.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-center font-medium animate-fade-in-up">
          ✅ Transaksi berhasil disimpan!
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner">
          <button onClick={() => setMode("scan")} className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'scan' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              Scan QR
            </div>
          </button>
          <button onClick={() => setMode("manual")} className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Input Manual
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {mode === "scan" ? (
          <div className="flex flex-col items-center justify-center p-8 md:p-12">
            <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center mb-6 border-4 border-gray-100 dark:border-gray-700">
              <Scanner 
                onScan={handleScan}
                onError={(err) => setCamError(err?.message || "Kamera diblokir atau tidak ditemukan")}
                components={{
                  audio: false,
                  finder: false,
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' }
                }}
              />
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse pointer-events-none"></div>
            </div>
            
            {camError ? (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                ⚠️ Error: {camError}
                <br/><span className="text-xs text-red-400 mt-1 block">Pastikan browser mengizinkan akses kamera, atau Anda menggunakan HTTPS/localhost.</span>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">Arahkan kamera ke QR Code Warga</p>
            )}
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Transaksi Kas Jimpitan</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border rounded-xl p-3 flex items-center cursor-pointer transition-colors ${form.jenisTrx === 'Masuk' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                    <input type="radio" name="jenisTrx" checked={form.jenisTrx === 'Masuk'} onChange={() => setForm({ ...form, jenisTrx: 'Masuk' })} className="text-emerald-600 focus:ring-emerald-500 mr-2" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Pemasukan (Setoran)</span>
                  </label>
                  <label className={`flex-1 border rounded-xl p-3 flex items-center cursor-pointer transition-colors ${form.jenisTrx === 'Keluar' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                    <input type="radio" name="jenisTrx" checked={form.jenisTrx === 'Keluar'} onChange={() => setForm({ ...form, jenisTrx: 'Keluar' })} className="text-red-600 focus:ring-red-500 mr-2" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Pengeluaran</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Nama Warga</label>
                <select value={form.wargaId} onChange={e => setForm({ ...form, wargaId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:text-white shadow-sm">
                  <option value="">-- Pilih Warga --</option>
                  {wargaList.map(w => (
                    <option key={w.id} value={w.id}>{w.namaKk} (RT {w.rt})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nominal Setoran</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {presets.map(p => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, nominal: String(p) })} className={`py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${form.nominal === String(p) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700 dark:text-gray-300'}`}>
                      Rp {p.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-medium">Rp</span>
                  <input type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} className="w-full pl-11 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keterangan (Opsional)</label>
                <input type="text" value={form.uraian} onChange={e => setForm({ ...form, uraian: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" placeholder="Setoran jimpitan harian" />
              </div>

              <div className="pt-4">
                <button type="button" onClick={handleSubmit} disabled={saving || !form.nominal} className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none">
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
