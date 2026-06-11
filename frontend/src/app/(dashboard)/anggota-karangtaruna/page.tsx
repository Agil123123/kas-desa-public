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
  const [searchQuery, setSearchQuery] = useState("");

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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Anggota Karangtaruna</h2>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari anggota..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white shadow-sm w-full sm:w-48"
            />
            {(userRole === 'Super Admin' || userRole === 'Admin') && (
              <button onClick={openCreate} className="px-3 py-1.5 w-full sm:w-auto text-center bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                + Tambah Anggota
              </button>
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
                  <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Anggota</th>
                  <th className="hidden sm:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jabatan</th>
                  <th className="hidden md:table-cell py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RT / Wilayah</th>
                  {(userRole === 'Super Admin' || userRole === 'Admin') && (
                    <th className="py-2 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {anggotaList.filter(item => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  const nama = item.nama.toLowerCase();
                  const jabatan = item.jabatan.toLowerCase();
                  const rt = item.rt ? item.rt.toLowerCase() : '';
                  return nama.includes(q) || jabatan.includes(q) || rt.includes(q);
                }).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 font-bold shadow-inner">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{item.nama}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5 sm:hidden">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{item.jabatan}</span>
                            {item.rt && <span className="text-gray-400">• RT {item.rt}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-3 sm:py-4 sm:px-6">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 shadow-sm">{item.jabatan}</span>
                    </td>
                    <td className="hidden md:table-cell py-3 px-3 sm:py-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400">
                      {item.rt ? `RT ${item.rt}` : '-'}
                    </td>
                    {(userRole === 'Super Admin' || userRole === 'Admin') && (
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                         <div className="flex justify-end items-center gap-1">
                           <button title="Edit" onClick={() => openEdit(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                           <button title="Hapus" onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                         </div>
                      </td>
                    )}
                  </tr>
                ))}
                {anggotaList.filter(item => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return item.nama.toLowerCase().includes(q) || item.jabatan.toLowerCase().includes(q) || (item.rt ? item.rt.toLowerCase() : '').includes(q);
                }).length === 0 && (
                  <tr><td colSpan={userRole === 'Super Admin' || userRole === 'Admin' ? 4 : 3} className="py-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>
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
