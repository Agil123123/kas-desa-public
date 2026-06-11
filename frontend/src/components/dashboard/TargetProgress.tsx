"use client";
import { useState, useEffect } from "react";

export default function TargetProgress() {
  const [target, setTarget] = useState(5000000);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/target')
      .then(res => res.json())
      .then(data => {
        if (data.target) setTarget(data.target);
        if (data.current !== undefined) setCurrent(data.current);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col justify-center">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pencapaian Target Jimpitan Bulan Ini</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Target jimpitan: Rp {target.toLocaleString('id-ID')}</p>
      
      <div className="relative mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-end">Rp {current.toLocaleString('id-ID')}</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {loading ? "Memuat data..." : target - current > 0 ? (
          <>Tersisa <span className="font-semibold text-gray-900 dark:text-white">Rp {(target - current).toLocaleString('id-ID')}</span> untuk mencapai target bulan ini.</>
        ) : (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Target bulan ini telah tercapai! 🎉</span>
        )}
      </p>
    </div>
  );
}
