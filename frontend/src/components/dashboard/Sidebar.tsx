import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, setIsOpen, role = "Admin" }: { isOpen: boolean, setIsOpen: (val: boolean) => void, role?: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara", "Petugas", "Anggota"], icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { href: "/data-warga", label: "Data Warga", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara", "Petugas"], icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/anggota-karangtaruna", label: "Anggota Karangtaruna", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara", "Petugas", "Anggota"], icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { href: "/kas-jimpitan", label: "Kas Jimpitan", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara"], icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/kas-karangtaruna", label: "Kas Karangtaruna", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara"], icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/dashboard/transaksi/input", label: "Input Transaksi", roles: ["Super Admin", "Admin", "Bendahara", "Petugas"], icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/laporan", label: "Laporan", roles: ["Super Admin", "Admin", "Ketua RT", "Bendahara"], icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/pengumuman", label: "Pengumuman", roles: ["Super Admin", "Admin", "Bendahara"], icon: "M11 5.882V19a1 1 0 001.706.707L16.293 16H18a2 2 0 002-2V7a2 2 0 00-2-2h-3.293L12.706 4.293A1 1 0 0011 5.882z" },
  ];

  const pengaturanItem = { href: "/pengaturan", label: "Pengaturan", roles: ["Admin"] };

  const normalizedRole = role === "Super Admin" ? "Admin" : role;
  const filteredNavItems = navItems.filter(item => item.roles.includes(normalizedRole));
  const showPengaturan = pengaturanItem.roles.includes(normalizedRole);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      <aside className={`print:hidden fixed inset-y-0 left-0 bg-white dark:bg-gray-900 w-64 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">NawaPintar</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <svg className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {showPengaturan && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link 
              href={pengaturanItem.href} 
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                pathname === pengaturanItem.href 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <svg className={`w-5 h-5 transition-transform duration-200 ${pathname === pengaturanItem.href ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {pengaturanItem.label}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
