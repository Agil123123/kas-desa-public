"use client";

import { useState, useEffect } from "react";

export default function PengumumanPage() {
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'Semua', type: 'info' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data && data.user) {
        setUserRole(data.user.role);
      }
    });
  }, []);

  const handleSend = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ ...form, title: '', message: '' });
      } else {
        alert('Gagal mengirim pengumuman.');
      }
    } catch (e) {
      alert('Terjadi kesalahan.');
    }
    setSaving(false);
  };

  if (!['Super Admin', 'Admin', 'Bendahara'].includes(userRole) && userRole !== '') {
    return <div className="p-10 text-center text-gray-500">Anda tidak memiliki akses ke halaman ini.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kirim Pengumuman</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kirim pesan dan notifikasi langsung kepada pengguna sistem.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Pengumuman berhasil dikirimkan ke target.
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Pengumuman</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Rapat Evaluasi Bulanan" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan / Isi Pengumuman</label>
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tuliskan pesan Anda di sini..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori (Warna Ikon)</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="info">Informasi (Biru)</option>
                <option value="success">Berhasil (Hijau)</option>
                <option value="warning">Peringatan (Kuning)</option>
                <option value="alert">Penting / Urgent (Merah)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penerima (Target Role)</label>
              <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Semua">Semua Pengguna</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin Saja</option>
                <option value="Bendahara">Bendahara Saja</option>
                <option value="Petugas">Petugas Jimpitan Saja</option>
                <option value="Ketua RT">Ketua RT Saja</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSend} 
              disabled={saving || !form.title || !form.message} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              {saving ? 'Mengirim...' : 'Kirim Pengumuman'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
