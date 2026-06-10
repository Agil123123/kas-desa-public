import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      {/* Background decorations */}
      <div className="absolute top-20 right-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]" aria-hidden="true">
        <div className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-200 to-emerald-600 opacity-20 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sistem Digitalisasi Jimpitan RT/RW
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
            Tinggalkan Buku Catatan, Beralih ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">QR Code</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 animate-fade-in-up" style={{animationDelay: '200ms'}}>
            Jimpitan Desa Digital memudahkan petugas mencatat uang jimpitan hanya dalam hitungan detik. Pantau pemasukan warga dan buku kas RT secara real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <Link href="/login" className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 text-center">
              Login Sistem
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30 text-center">
              Daftar Anggota
            </Link>
            <Link href="#fitur" className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-full font-semibold text-lg transition-colors text-center">
              Pelajari Fitur
            </Link>
          </div>
        </div>
        
        {/* Mockup Dashboard or App */}
        <div className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up" style={{animationDelay: '400ms'}}>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video relative flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
               <div className="text-center z-10">
                 <svg className="w-20 h-20 mx-auto text-emerald-500 mb-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                 </svg>
                 <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Scan. Input. Selesai.</h3>
                 <p className="text-gray-500 dark:text-gray-400 mt-2">Kurang dari 5 detik per rumah</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
