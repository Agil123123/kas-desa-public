"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type Warga = {
  id: string;
  kodeUnik: string;
  nik: string;
  namaKk: string;
  rt: string;
  rw: string;
};

import { Suspense } from "react";

function CetakQRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rtParam = searchParams.get('rt') || 'semua';
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/warga');
        const data = await res.json();
        
        if (!res.ok) {
          setErrorMsg(data.error || 'Gagal memuat data');
          setLoading(false);
          return;
        }

        if (!Array.isArray(data)) {
          setErrorMsg('Data yang diterima tidak valid');
          setLoading(false);
          return;
        }

        let filtered = data;
        if (rtParam !== 'semua') {
          filtered = data.filter((w: Warga) => w.rt === rtParam);
        }
        
        setWargaList(filtered);
        setLoading(false);
        
        // Auto print after a short delay to ensure QR codes are rendered
        if (filtered.length > 0) {
          setTimeout(() => {
            window.print();
          }, 800);
        }
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e.message || 'Terjadi kesalahan jaringan');
        setLoading(false);
      }
    }
    fetchData();
  }, [rtParam]);

  if (loading) {
    return <div className="p-10 text-center font-medium">Menyiapkan dokumen cetak...</div>;
  }

  if (errorMsg) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-4">{errorMsg}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-lg font-medium text-gray-700">
          Kembali
        </button>
      </div>
    );
  }

  if (wargaList.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">Tidak ada data warga untuk dicetak (RT {rtParam}).</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-lg font-medium text-gray-700">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black print:bg-white">
      {/* Tombol aksi non-print */}
      <div className="print:hidden mb-6 p-4 bg-gray-100 rounded-lg flex items-center justify-between border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pratinjau Cetak QR Code (RT: {rtParam === 'semua' ? 'Semua' : rtParam})</h1>
          <p className="text-sm text-gray-600">Total: {wargaList.length} Warga. Kertas yang disarankan: A4.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
            Batal & Kembali
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Cetak Sekarang
          </button>
        </div>
      </div>

      {/* Area Cetak (Kertas) */}
      <div className="grid grid-cols-3 gap-6 print:gap-4 w-full max-w-[210mm] mx-auto print:mx-0 print:max-w-none print:w-full">
        {wargaList.map((warga) => (
          <div 
            key={warga.id} 
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-400 rounded-xl break-inside-avoid bg-white"
            style={{ height: '180px' }}
          >
            <div className="font-bold text-sm text-center mb-2 line-clamp-1 truncate w-full px-2" title={warga.namaKk}>
              {warga.namaKk}
            </div>
            
            <div className="bg-white p-1 rounded-lg">
              <QRCodeSVG value={warga.kodeUnik} size={80} level="M" />
            </div>
            
            <div className="mt-2 flex items-center justify-between w-full px-4">
              <span className="text-[10px] font-bold px-2 py-0.5 border border-black rounded-md">RT {warga.rt}</span>
              <span className="text-[10px] font-mono tracking-widest">{warga.kodeUnik}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CetakQRPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-medium">Memuat halaman cetak...</div>}>
      <CetakQRContent />
    </Suspense>
  );
}
