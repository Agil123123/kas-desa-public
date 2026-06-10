import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white">NawaPintar</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Sistem informasi digital untuk pencatatan dan pengelolaan keuangan Organisasi desa secara transparan, akurat, dan real-time.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tautan</h4>
            <ul className="space-y-2">
              <li><Link href="#fitur" className="hover:text-emerald-400 transition-colors">Fitur Utama</Link></li>
              <li><Link href="#pengguna" className="hover:text-emerald-400 transition-colors">Untuk Siapa</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Login Sistem</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li><Link href="/panduan-pengguna" className="hover:text-emerald-400 transition-colors">Panduan Pengguna</Link></li>
              <li><Link href="/kebijakan-privasi" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</Link></li>
              <li className="pt-2 text-sm text-gray-400">Hubungi Kami:</li>
              <li className="text-sm"><a href="https://wa.me/6281326036344" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">WhatsApp: 081326036344</a></li>
              <li className="text-sm"><a href="mailto:agilardhy69@gmail.com" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Email: agilardhy69@gmail.com</a></li>
              <li className="text-sm"><a href="mailto:kartar@nawasena.id" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Email: kartar@nawasena.id</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} NawaPintar. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-4">
            <span className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
