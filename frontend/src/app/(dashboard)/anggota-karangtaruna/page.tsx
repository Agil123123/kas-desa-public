"use client";
import { useState, useEffect, useCallback } from "react";
import StrukturOrganisasi from "@/components/StrukturOrganisasi";

type Anggota = {
  id: string;
  nama: string;
  jabatan: string;
  rt: string | null;
};

export default function AnggotaKarangtarunaPage() {
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: '', jabatan: '', rt: '' });
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState("Anggota");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUserRole(data.user.role);
      })
      .catch(console.error);
      
    fetch('/api/pengaturan')
      .then(res => res.json())
      .then(data => {
        if (data && data.namaOrganisasi) setOrgName(data.namaOrganisasi);
      })
      .catch(console.error);
  }, []);

  const fetchAnggota = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/anggota');
    const data = await res.json();
    setAnggotaList(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnggota(); }, [fetchAnggota]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ nama: '', jabatan: '', rt: '' });
    setShowModal(true);
  };

  const openEdit = (a: Anggota) => {
    setEditingId(a.id);
    setForm({ nama: a.nama, jabatan: a.jabatan, rt: a.rt || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/anggota/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      } else {
        await fetch('/api/anggota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchAnggota();
    } catch { alert('Gagal menyimpan data.'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    await fetch(`/api/anggota/${id}`, { method: 'DELETE' });
    fetchAnggota();
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anggota & Pengurus Karangtaruna {orgName ? `(${orgName})` : ''}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Struktur organisasi dan daftar anggota aktif Karangtaruna {orgName ? `${orgName}` : ''}.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-6 md:p-10">
        <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Struktur Organisasi</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto mt-2 rounded-full"></div>
        </div>
        <StrukturOrganisasi data={anggotaList} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Anggota Karangtaruna</h2>
          {(userRole === 'Super Admin' || userRole === 'Admin') && (
            <button onClick={openCreate} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors">
              + Tambah Anggota
            </button>
          )}
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
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jabatan</th>
                  <th className="py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">RT / Wilayah</th>
                  {(userRole === 'Super Admin' || userRole === 'Admin') && (
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {anggotaList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-6 font-medium text-gray-900 dark:text-white">{item.nama}</td>
                    <td className="py-3 px-6"><span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.jabatan}</span></td>
                    <td className="py-3 px-6 text-gray-500 dark:text-gray-400">{item.rt || '-'}</td>
                    {(userRole === 'Super Admin' || userRole === 'Admin') && (
                      <td className="py-3 px-6 text-center">
                        <button onClick={() => openEdit(item)} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mr-3">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 font-medium text-sm">Hapus</button>
                      </td>
                    )}
                  </tr>
                ))}
                {anggotaList.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data anggota.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Anggota */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
                <input type="text" value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ketua / Sekretaris / Bendahara / dll" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RT / Wilayah</label>
                <input type="text" value={form.rt} onChange={e => setForm({ ...form, rt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="01" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.nama || !form.jabatan} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
