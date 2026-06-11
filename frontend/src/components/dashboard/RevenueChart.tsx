"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ title = "Tren Pemasukan", type = "combined" }: { title?: string, type?: "karangtaruna" | "jimpitan" | "combined" }) {
  const [filter, setFilter] = useState("8 Minggu");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-emerald-100 dark:border-gray-700 p-3 rounded-xl shadow-lg shadow-emerald-500/10 min-w-[200px]">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name === "karangtaruna" ? "Karangtaruna" : entry.name === "jimpitan" ? "Jimpitan" : "Nominal"}
              </span>
              <span className="font-bold text-sm" style={{ color: entry.color }}>
                Rp {entry.value.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (!isMobile) return value.toLocaleString('id-ID');
    if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1).replace('.', ',')}Jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}Rb`;
    return value.toString();
  };

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
          <BarChart
            data={data}
            margin={{ top: 20, right: isMobile ? 10 : 10, left: 0, bottom: 0 }}
            barGap={isMobile ? 2 : 8}
          >
            <defs>
              <linearGradient id="colorKarangtaruna" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.5}/>
              </linearGradient>
              <linearGradient id="colorJimpitan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: isMobile ? 11 : 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              domain={[0, 'auto']}
              tickCount={isMobile ? 5 : 6}
              width={isMobile ? 50 : 80}
              tick={{ fill: '#9ca3af', fontSize: isMobile ? 11 : 12, fontWeight: 500 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
            {type === 'combined' ? (
              <>
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} formatter={(value: string) => <span className="text-gray-700 dark:text-gray-300 ml-1 font-medium">{value === 'karangtaruna' ? 'Karangtaruna' : 'Jimpitan'}</span>} />
                <Bar dataKey="karangtaruna" fill="url(#colorKarangtaruna)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                <Bar dataKey="jimpitan" fill="url(#colorJimpitan)" radius={[6, 6, 0, 0]} animationDuration={1500} />
              </>
            ) : (
              <Bar dataKey="amount" fill={type === 'karangtaruna' ? 'url(#colorKarangtaruna)' : 'url(#colorJimpitan)'} radius={[6, 6, 0, 0]} animationDuration={1500} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
