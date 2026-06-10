"use client";
import { useState, useEffect, useCallback } from "react";

type Settings = { id: string; namaOrganisasi: string; alamat: string; dusun: string; rw: string; targetJimpitan: number; allowedDomains: string };
type RtItem = { id: string; nomor: string; ketuaRt: string | null; jumlahKk: number | null };
type UserItem = { id: string; name: string; email: string; role: string; isActive: boolean | null };

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState("umum");

  // ── Umum & Alamat ──────────────────────────────────
  const [settings, setSettings] = useState<Settings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/pengaturan');
    const data = await res.json();
    setSettings(data);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    await fetch('/api/pengaturan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSavingSettings(false);
    alert('Pengaturan berhasil disimpan!');
  };

  // ── Master RT ──────────────────────────────────────
  const [rtList, setRtList] = useState<RtItem[]>([]);
  const [showRtModal, setShowRtModal] = useState(false);
  const [editingRtId, setEditingRtId] = useState<string | null>(null);
  const [rtForm, setRtForm] = useState({ nomor: '', ketuaRt: '', jumlahKk: '' });
  const [savingRt, setSavingRt] = useState(false);

  const fetchRt = useCallback(async () => {
    const res = await fetch('/api/rt');
    setRtList(await res.json());
  }, []);

  useEffect(() => { fetchRt(); }, [fetchRt]);

  const openCreateRt = () => { setEditingRtId(null); setRtForm({ nomor: '', ketuaRt: '', jumlahKk: '' }); setShowRtModal(true); };
  const openEditRt = (r: RtItem) => { setEditingRtId(r.id); setRtForm({ nomor: r.nomor, ketuaRt: r.ketuaRt || '', jumlahKk: String(r.jumlahKk || 0) }); setShowRtModal(true); };

  const handleSaveRt = async () => {
    setSavingRt(true);
    const body = { nomor: rtForm.nomor, ketuaRt: rtForm.ketuaRt, jumlahKk: parseInt(rtForm.jumlahKk) || 0 };
    if (editingRtId) {
      await fetch(`/api/rt/${editingRtId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/rt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setShowRtModal(false); fetchRt(); setSavingRt(false);
  };

  const handleDeleteRt = async (id: string) => {
    if (!confirm('Yakin ingin menghapus RT ini?')) return;
    await fetch(`/api/rt/${id}`, { method: 'DELETE' });
    fetchRt();
  };

  // ── Manajemen Akun ─────────────────────────────────
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Petugas', password: '', isActive: true });
  const [savingUser, setSavingUser] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("Petugas");

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUserRole(data.user.role);
      })
      .catch(console.error);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users');
    setUserList(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreateUser = () => { setEditingUserId(null); setUserForm({ name: '', email: '', role: 'Petugas', password: '', isActive: true }); setShowUserModal(true); };
  const openEditUser = (u: UserItem) => { setEditingUserId(u.id); setUserForm({ name: u.name, email: u.email, role: u.role, password: '', isActive: u.isActive !== false }); setShowUserModal(true); };

  const handleSaveUser = async () => {
    setSavingUser(true);
    if (editingUserId) {
      await fetch(`/api/users/${editingUserId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
    } else {
      await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
    }
    setShowUserModal(false); fetchUsers(); setSavingUser(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Yakin ingin menghapus akun ini?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleImpersonate = async (email: string) => {
    if (!confirm(`Login sebagai ${email}? Sesi Anda saat ini akan diakhiri.`)) return;
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal login sebagai pengguna ini.');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  };

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'Bendahara': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Petugas': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Ketua RT': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Sistem</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Konfigurasi operasional, data master, dan integrasi aplikasi.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6">
        {[{ key: 'umum', label: 'Umum & Alamat' }, { key: 'rt', label: 'Master Data RT' }, { key: 'akun', label: 'Manajemen Akun' }, { key: 'integrasi', label: 'Integrasi Laporan' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`py-3 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>{tab.label}</button>
        ))}
      </div>

      {/* ═══ TAB UMUM ═══ */}
      {activeTab === "umum" && settings && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profil Organisasi & Alamat</h2>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Organisasi</label>
                <input type="text" value={settings.namaOrganisasi} onChange={e => setSettings({ ...settings, namaOrganisasi: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                <textarea rows={3} value={settings.alamat} onChange={e => setSettings({ ...settings, alamat: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dusun / Pedukuhan</label>
                  <input type="text" value={settings.dusun} onChange={e => setSettings({ ...settings, dusun: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RW (Rukun Warga)</label>
                  <input type="text" value={settings.rw} onChange={e => setSettings({ ...settings, rw: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSaveSettings} disabled={savingSettings} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {savingSettings ? 'Menyimpan...' : 'Simpan Alamat'}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aturan Jimpitan</h2>
            <div className="max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Jimpitan Per KK (Bulan)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500">Rp</span>
                  <input type="number" value={settings.targetJimpitan} onChange={e => setSettings({ ...settings, targetJimpitan: parseInt(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Email yang Diizinkan (Pendaftaran)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pisahkan dengan koma (contoh: gmail.com, nawapintar.com). Hanya email dengan domain ini yang bisa mendaftar.</p>
                <input type="text" value={settings.allowedDomains || ''} onChange={e => setSettings({ ...settings, allowedDomains: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="gmail.com, nawapintar.com" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} disabled={savingSettings} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">Simpan Konfigurasi</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB MASTER DATA RT ═══ */}
      {activeTab === "rt" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Master Data Lingkungan RT</h2>
            <button onClick={openCreateRt} className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium rounded-lg text-sm">+ Tambah RT Baru</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nomor RT</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Ketua RT</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Jumlah KK</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rtList.map(r => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">RT {r.nomor}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{r.ketuaRt || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{r.jumlahKk} KK</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => openEditRt(r)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDeleteRt(r.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
                {rtList.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data RT.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB MANAJEMEN AKUN ═══ */}
      {activeTab === "akun" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manajemen Akun Pengguna</h2>
            <button onClick={openCreateUser} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm">+ Tambah Akun / User</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role / Akses</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {userList.map(u => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs rounded font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>{u.role}</span></td>
                    <td className="py-3 px-4">
                      {u.isActive !== false ? 
                        <span className="px-2 py-1 text-xs rounded font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span> : 
                        <span className="px-2 py-1 text-xs rounded font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Pending</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
                      {currentUserRole === 'Super Admin' && (
                        <button onClick={() => handleImpersonate(u.email)} className="text-emerald-600 hover:text-emerald-800 mr-3 text-sm font-medium">Login as</button>
                      )}
                      <button onClick={() => openEditUser(u)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada akun.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB INTEGRASI ═══ */}
      {activeTab === "integrasi" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sinkronisasi Google Sheets</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm mb-4">Hubungkan sistem dengan Google Sheets agar laporan otomatis diunggah (sync) setiap bulan tanpa perlu export manual.</p>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spreadsheet ID</label>
                  <input type="text" placeholder="Masukkan ID dari URL Google Sheets Anda" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Service Account JSON</label>
                  <textarea rows={3} placeholder="Paste kredensial JSON dari Google Cloud Console" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 font-mono text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-blue-500/20">Simpan Konfigurasi</button>
                  <button className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">Tes Koneksi</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL RT ═══ */}
      {showRtModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingRtId ? 'Edit RT' : 'Tambah RT Baru'}</h2>
              <button onClick={() => setShowRtModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor RT</label><input type="text" value={rtForm.nomor} onChange={e => setRtForm({ ...rtForm, nomor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="04" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Ketua RT</label><input type="text" value={rtForm.ketuaRt} onChange={e => setRtForm({ ...rtForm, ketuaRt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah KK (Opsional)</label><input type="number" value={rtForm.jumlahKk} onChange={e => setRtForm({ ...rtForm, jumlahKk: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Kosongkan jika belum ada" /></div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={() => setShowRtModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleSaveRt} disabled={savingRt || !rtForm.nomor} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50">{savingRt ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL USER ═══ */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingUserId ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label><input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {editingUserId && '(Kosongkan jika tidak diubah)'}</label><input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Minimal 6 karakter" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Hak Akses</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Ketua RT">Ketua RT</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Petugas">Petugas Jimpitan</option>
                  <option value="Anggota">Anggota</option>
                </select>
              </div>
              <div className="flex items-center mt-2">
                <input type="checkbox" id="isActive" checked={userForm.isActive} onChange={e => setUserForm({ ...userForm, isActive: e.target.checked })} className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Akun Aktif (Diizinkan Login)</label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleSaveUser} disabled={savingUser || !userForm.name || !userForm.email} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50">{savingUser ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
