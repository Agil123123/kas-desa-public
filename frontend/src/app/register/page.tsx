"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-emerald-100 rounded-full blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-100 rounded-full blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/4"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="flex justify-center">
          <Link href="/">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer transform hover:scale-105 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Daftar Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-white">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-emerald-700">Pendaftaran berhasil! Mengalihkan ke halaman login...</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 font-semibold focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/50 focus:bg-white transition-colors"
                  placeholder="Budi Santoso"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 font-semibold focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/50 focus:bg-white transition-colors"
                  placeholder="budi@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 font-semibold focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/50 focus:bg-white transition-colors"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 font-semibold focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/50 focus:bg-white transition-colors"
                  placeholder="Ulangi kata sandi"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md shadow-emerald-500/20 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
