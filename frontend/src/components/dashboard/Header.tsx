"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function Header({ onMenuClick, role = "Anggota", setRole }: { onMenuClick: () => void, role?: string, setRole?: (val: string) => void }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userName, setUserName] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Form states
  const [editName, setEditName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserName(data.user.name);
          setEditName(data.user.name);
        }
      })
      .catch(console.error);

    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push("/login");
    router.refresh();
  };

  const handleUpdateProfile = async () => {
    setProfileMsg({ type: '', text: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setProfileMsg({ type: 'error', text: 'Konfirmasi sandi baru tidak cocok!' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileMsg({ type: 'error', text: 'Sandi baru minimal 6 karakter!' });
      return;
    }

    setLoadingUpdate(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          oldPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Gagal memperbarui profil' });
      } else {
        setUserName(editName);
        setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Optionally close modal after success
        setTimeout(() => {
          setShowEditProfile(false);
          setProfileMsg({ type: '', text: '' });
        }, 2000);
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' });
    }
    setLoadingUpdate(false);
  };

  const handleNotifClick = async (notif: Notification) => {
    setSelectedNotif(notif);
    setShowNotifMenu(false);
    
    if (!notif.isRead) {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      // API call to mark as read
      try {
        await fetch(`/api/notifications/${notif.id}`, { method: 'PUT' });
      } catch (e) {
        console.error('Failed to mark read', e);
      }
    }
  };

  return (
    <>
    <header className="print:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Hak Akses:</span>
          <span className="bg-transparent text-sm font-semibold text-emerald-600 dark:text-emerald-400 outline-none">{role}</span>
        </div>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 relative transition-all duration-300 hover:scale-110 hover:rotate-6"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {notifications.length > 0 && notifications.some(n => !n.isRead) && (
              <>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 z-10"></span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
              </>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-10 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifikasi</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  {notifications.filter(n => !n.isRead).length} Baru
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">Tidak ada notifikasi.</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} onClick={() => handleNotifClick(notif)} className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {notif.type === 'alert' ? <div className="w-2 h-2 rounded-full bg-red-500"></div> :
                           notif.type === 'transaction' ? <div className="w-2 h-2 rounded-full bg-emerald-500"></div> :
                           notif.type === 'manual' ? <div className="w-2 h-2 rounded-full bg-blue-500"></div> :
                           <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-4 relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{userName || "User"}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{role}</p>
          </div>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-200 transition-colors"
          >
            {userName ? userName.substring(0, 2).toUpperCase() : "U"}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up" ref={profileRef}>
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{role}</p>
              </div>
              <button 
                onClick={() => { 
                  setEditName(userName);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setProfileMsg({ type: '', text: '' });
                  setShowEditProfile(true); 
                  setShowProfileMenu(false); 
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Profil
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Profile Edit Modal */}
    {showEditProfile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan Profil</h3>
            <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            {profileMsg.text && (
              <div className={`p-4 rounded-xl text-sm border ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800'}`}>
                {profileMsg.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white" />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Ubah Sandi (Opsional)</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sandi Lama</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white" placeholder="Biarkan kosong jika tidak diubah" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sandi Baru</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white" placeholder="Sandi baru minimal 6 karakter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konfirmasi Sandi Baru</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white" placeholder="Ulangi sandi baru" />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button onClick={() => setShowEditProfile(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Batal</button>
            <button onClick={handleUpdateProfile} disabled={loadingUpdate} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-2">
              {loadingUpdate ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Notification Details Modal */}
    {selectedNotif && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedNotif.type === 'alert' ? 'bg-red-500' : selectedNotif.type === 'transaction' ? 'bg-emerald-500' : selectedNotif.type === 'manual' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Pesan</h3>
            </div>
            <button onClick={() => setSelectedNotif(null)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{selectedNotif.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{new Date(selectedNotif.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
              {selectedNotif.message}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
            <button onClick={() => setSelectedNotif(null)} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
