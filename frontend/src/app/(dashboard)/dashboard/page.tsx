import MetricCards from "@/components/dashboard/MetricCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TargetProgress from "@/components/dashboard/TargetProgress";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ringkasan Keuangan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Pantau pemasukan jimpitan dan performa organisasi secara real-time.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/transaksi/input" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-600/30 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          Mulai Scan QR Jimpitan
        </Link>
      </div>

      <MetricCards />
      
      <div className="mb-6">
        <RevenueChart title="Tren Pemasukan Kas Karangtaruna & Jimpitan" type="combined" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <TargetProgress />
        </div>
      </div>
    </div>
  );
}
