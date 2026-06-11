"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ title = "Tren Pemasukan", type = "karangtaruna" }: { title?: string, type?: "karangtaruna" | "jimpitan" }) {
  const [filter, setFilter] = useState("8 Minggu");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/chart?filter=${filter}&type=${type}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [filter, type]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-emerald-100 dark:border-gray-700 p-3 rounded-xl shadow-lg shadow-emerald-500/10">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  const gradientColor = type === "karangtaruna" ? "#10b981" : "#3b82f6";
  const gradientId = `colorAmount-${type}`;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Periode: {filter}</p>
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
        >
          <option value="1 Minggu">1 Minggu Terakhir</option>
          <option value="4 Minggu">4 Minggu Terakhir</option>
          <option value="8 Minggu">8 Minggu Terakhir</option>
          <option value="6 Bulan">6 Bulan Terakhir</option>
        </select>
      </div>
      
      <div className="w-full h-72 mt-4 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10 rounded-xl">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `Rp ${value >= 1000000 ? (value / 1000000) + 'M' : (value / 1000) + 'K'}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: gradientColor, strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={gradientColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
              activeDot={{ r: 6, fill: gradientColor, stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
