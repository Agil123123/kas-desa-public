"use client";
import { useState, useEffect } from "react";

export default function MetricCards() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isOpenKarangtaruna, setIsOpenKarangtaruna] = useState(false);
  const [isOpenJimpitan, setIsOpenJimpitan] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setDashboardData)
      .catch(console.error);
  }, []);

  const kasKarangtaruna = [
    { title: "Pemasukan Bulan Ini", value: `Rp ${(dashboardData?.kasMasukStats?.month || 0).toLocaleString('id-ID')}`, change: "Bulanan", trend: "up", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Pengeluaran Bulan Ini", value: `Rp ${(dashboardData?.kasKeluarStats?.month || 0).toLocaleString('id-ID')}`, change: "Bulanan", trend: "down", icon: "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Total Pemasukan", value: `Rp ${(dashboardData?.kasMasukStats?.total || 0).toLocaleString('id-ID')}`, change: "Keseluruhan", trend: "up", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { title: "Total Kas Karangtaruna", value: `Rp ${(dashboardData?.saldoKasKarangtaruna || 0).toLocaleString('id-ID')}`, change: "Total Saldo", trend: "up", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" }
  ];

  const kasJimpitan = [
    { title: "Jimpitan Bulan Ini", value: `Rp ${(dashboardData?.jimpitanMasukStats?.month || dashboardData?.jimpitanStats?.month || 0).toLocaleString('id-ID')}`, change: "Bulanan", trend: "up", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Pengeluaran Jimpitan", value: `Rp ${(dashboardData?.jimpitanKeluarStats?.total || 0).toLocaleString('id-ID')}`, change: "Total", trend: "down", icon: "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Total Pemasukan Jimpitan", value: `Rp ${(dashboardData?.jimpitanMasukStats?.total || dashboardData?.jimpitanStats?.year || 0).toLocaleString('id-ID')}`, change: "Keseluruhan", trend: "up", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { title: "Total Saldo Jimpitan", value: `Rp ${(dashboardData?.totalJimpitanKeseluruhan || 0).toLocaleString('id-ID')}`, change: "Total Saldo", trend: "up", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" }
  ];


  const renderCards = (data: any[], isOpen: boolean) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
      {data.map((metric, index) => (
        <div key={index} className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-gray-700 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner ${metric.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
              <svg className={`w-6 h-6 ${metric.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
              </svg>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-transform duration-300 group-hover:scale-105 ${metric.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.trend === 'up' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              {metric.change}
            </div>
          </div>
          <div className="relative">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 mb-8">
      {/* Karangtaruna Accordion */}
      <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all hover:bg-white dark:hover:bg-gray-800 cursor-pointer" onClick={() => setIsOpenKarangtaruna(!isOpenKarangtaruna)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Ringkasan Kas Karangtaruna</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Kas: Rp {(dashboardData?.saldoKasKarangtaruna || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpenKarangtaruna ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        {renderCards(kasKarangtaruna, isOpenKarangtaruna)}
      </div>

      {/* Jimpitan Accordion */}
      <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all hover:bg-white dark:hover:bg-gray-800 cursor-pointer" onClick={() => setIsOpenJimpitan(!isOpenJimpitan)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Ringkasan Kas Jimpitan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Kas: Rp {(dashboardData?.totalJimpitanKeseluruhan || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpenJimpitan ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        {renderCards(kasJimpitan, isOpenJimpitan)}
      </div>
    </div>
  );
}
