"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState("Anggota");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login');
        } else {
          res.json().then(data => {
            setActiveRole(data.user.role);
            setLoading(false);
          });
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role={activeRole} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} min-w-0`}>
        <Header onMenuClick={() => setSidebarOpen(true)} role={activeRole} setRole={setActiveRole} />
        <main className="print:p-0 print:m-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
