import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 top-0 left-0 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">NawaPintar</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#fitur" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors font-medium">Fitur</Link>
            <Link href="#pengguna" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors font-medium">Pengguna</Link>
            <Link href="/login" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30">
              Masuk
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
