"use client";
import { useState, useEffect } from "react";

export default function MetricCards() {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setDashboardData)
      .catch(console.error);
  }, []);

  const kasKarangtaruna = [
    { title: "Pemasukan Hari Ini", value: `Rp ${(dashboardData?.kasMasukStats?.today || 0).toLocaleString('id-ID')}`, change: "Harian", trend: "up", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Pemasukan Minggu Ini", value: `Rp ${(dashboardData?.kasMasukStats?.week || 0).toLocaleString('id-ID')}`, change: "Mingguan", trend: "up", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { title: "Pemasukan Bulan Ini", value: `Rp ${(dashboardData?.kasMasukStats?.month || 0).toLocaleString('id-ID')}`, change: "Bulanan", trend: "up", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { title: "Total Kas Karangtaruna", value: `Rp ${(dashboardData?.saldoKasKarangtaruna || 0).toLocaleString('id-ID')}`, change: "Total Saldo", trend: "up", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" }
  ];

  const kasJimpitan = [
    { title: "Jimpitan Hari Ini", value: `Rp ${(dashboardData?.jimpitanStats?.today || 0).toLocaleString('id-ID')}`, change: "Harian", trend: "up", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Jimpitan Minggu Ini", value: `Rp ${(dashboardData?.jimpitanStats?.week || 0).toLocaleString('id-ID')}`, change: "Mingguan", trend: "up", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { title: "Jimpitan Bulan Ini", value: `Rp ${(dashboardData?.jimpitanStats?.month || 0).toLocaleString('id-ID')}`, change: "Bulanan", trend: "up", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { title: "Total Saldo Jimpitan", value: `Rp ${(dashboardData?.jimpitanStats?.total || 0).toLocaleString('id-ID')}`, change: "Total Saldo", trend: "up", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" }
  ];


  const renderCards = (data: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((metric, index) => (
        <div key={index} className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-gray-700 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    <div>
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Ringkasan Kas Karangtaruna</h2>
      {renderCards(kasKarangtaruna)}
      
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Ringkasan Kas Jimpitan</h2>
      {renderCards(kasJimpitan)}
    </div>
  );
}
