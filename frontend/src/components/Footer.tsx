import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  // Footer is static for now (no active navigation links)
  // const navigate = useNavigate();

  return (
    <footer className="bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start md:items-center text-center md:text-left">
          {/* Left column: logo + subscribe (centered) */}
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <div className="logo-footer-w">
              <img src="/fridayfooter.png" alt="Logo Fridays" className="h-14 object-contain" />
            </div>

            <div className="container--form text-center md:text-left">
              <h4 className="text-lg font-semibold mb-3">¿Quieres recibir promociones y noticias?</h4>
              <div className="flex items-center bg-white rounded shadow-sm overflow-hidden max-w-md mx-auto md:mx-0">
                <input type="text" placeholder="Correo" className="flex-1 px-4 py-3 outline-none text-sm" />
                <button className="px-4 bg-gray-200">
                  <svg width="10" height="10" viewBox="0 0 10 10" className="block" aria-hidden>
                    <path d="M0 5h8M5 0l5 5-5 5" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 text-sm">
                <label className="inline-flex items-start space-x-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Aceptar las <a className="underline">Políticas de privacidad de datos.</a></span>
                </label>
              </div>
            </div>
          </div>

          {/* Middle: site map + legal (centered for better balance) */}
          <div className="flex flex-col md:flex-row md:space-x-12 justify-center">
            <div className="menuFooter mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-3">Mapa del sitio</h3>
              <ul className="space-y-2 text-sm">
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Promociones</button></li>
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Locales</button></li>
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Nosotros</button></li>
              </ul>
            </div>

            <div className="menuFooter">
              <h3 className="text-lg font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Términos y condiciones</button></li>
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Políticas de privacidad</button></li>
                <li><button type="button" className="text-gray-600 hover:text-gray-900">Legales</button></li>
              </ul>

              <div className="mt-4 space-y-3">
                <button type="button" className="w-full text-left px-4 py-2 border rounded bg-white text-sm">Comprobantes electrónicos</button>
                <button type="button" className="w-full text-left px-4 py-2 border rounded bg-white text-sm">Trabaja con nosotros</button>
              </div>
            </div>
          </div>

          {/* Right: social, claimbook (shift slightly left on md screens) */}
          <div className="fcolumn-right space-y-6 flex flex-col items-center md:items-start md:pl-6">
            <div>
              <b>Síguenos a través de:</b>
              <div className="flex items-center space-x-3 mt-3 justify-center md:justify-end">
                <span className="p-2 bg-white rounded-full shadow-sm text-gray-700"><Facebook size={18} /></span>
                <span className="p-2 bg-white rounded-full shadow-sm text-gray-700"><Instagram size={18} /></span>
              </div>
            </div>

            <div>
              <b>Libro de reclamaciones</b>
              <div className="btn-claimbook mt-3">
                <div className="inline-block">
                  <img src="/librodereclamaciones.png" alt="Libro de reclamaciones" className="h-14 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-beige py-4">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="font-bold">LOCALES</div>
          <div className="bg-teal-200 px-6 py-2 font-bold">ORDENA AQUÍ</div>
        </div>
      </div>
    </footer>
  );
}
