import React from 'react';
import { 
  Clock, 
  Ticket, 
  Ban, 
  Trees, 
  Utensils, 
  Backpack, 
  Tent, 
  AlertTriangle,
  MapPin,
  Info
} from 'lucide-react';

export default function Informacion() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-20">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-xs border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 rounded-full">
            <Info className="h-3 w-3" /> Guía del Viajero
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Información <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Esencial</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Prepara tu visita al Jardín de las Delicias con todos los datos necesarios para una aventura segura e inolvidable.
          </p>
        </div>

        {/* --- SECCIÓN DESTACADA: HORARIOS Y PRECIOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Horarios */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-emerald-500/30 transition-colors group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Horario de Ingreso</h3>
              <p className="text-slate-400 text-sm mb-2">Abierto todos los días para que disfrutes la naturaleza.</p>
              <div className="text-2xl font-black text-white">08:00 - 18:00 <span className="text-sm font-medium text-slate-500">hrs</span></div>
            </div>
          </div>

          {/* Tarifas */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-orange-500/30 transition-colors group">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Ticket className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">Tarifas de Ingreso</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 text-sm">Comunidad (General)</span>
                  <span className="font-bold text-white">15 Bs</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 text-sm">Parque Amboró (Nacionales)</span>
                  <span className="font-bold text-white">20 Bs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Parque Amboró (Extranjeros)</span>
                  <span className="font-bold text-white">100 Bs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID DE INFORMACIÓN DETALLADA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna 1: Reglas (Importante) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <Ban className="h-6 w-6" /> Reglas del Parque
              </h2>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 font-bold">•</span> No ingresar bebidas alcohólicas ni sustancias controladas.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 font-bold">•</span> Prohibido el ingreso de mascotas (por fauna nativa).
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 font-bold">•</span> Prohibido hacer fogatas fuera de áreas designadas.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 font-bold">•</span> <strong>Llévate tu basura.</strong> Ayúdanos a mantener el lugar limpio.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 font-bold">•</span> No extraer plantas ni molestar a los animales silvestres.
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-400" /> Seguridad
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Para tu seguridad y la conservación del área protegida, está terminantemente prohibido desviarse de los senderos marcados o ingresar a zonas restringidas sin un guía autorizado.
              </p>
            </div>
          </div>

          {/* Columna 2 y 3: Actividades y Servicios */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Actividades */}
            <div className="bg-slate-900/30 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trees className="h-6 w-6 text-green-400" /> Actividades
              </h2>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Visita a cataratas y piscinas naturales</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Trekking y senderismo por la selva</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Avistamiento de aves y flora</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Rappel y Tirolesa <span className="text-xs text-slate-500">(con operadores)</span></li>
              </ul>
            </div>

            {/* Gastronomía */}
            <div className="bg-slate-900/30 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-orange-400" /> Gastronomía
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Las comunarias preparan deliciosas comidas típicas criollas los fines de semana.
              </p>
              <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 border border-slate-700">
                🔥 También contamos con alquiler de parrillas para que prepares tu propio asado.
              </div>
            </div>

            {/* Recomendaciones (Span 2 cols en MD) */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Backpack className="h-6 w-6 text-indigo-400" /> Qué llevar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-sm text-slate-300">Ropa cómoda y zapatos de trekking con buena suela (el terreno puede ser resbaloso).</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-sm text-slate-300">Repelente para mosquitos y protector solar biodegradable.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-sm text-slate-300">Suficiente agua para hidratarte durante las caminatas.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-sm text-slate-300">Dinero en efectivo (no hay cajeros ni buena señal para transferencias).</p>
                </div>
              </div>
            </div>

            {/* Camping */}
            <div className="md:col-span-2 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="p-4 bg-emerald-500/20 rounded-full text-emerald-400">
                <Tent className="h-8 w-8" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-white">Zona de Camping</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Vive la experiencia completa durmiendo bajo las estrellas. Puedes traer tu propia carpa o alquilar una en la comunidad.
                </p>
                <div className="mt-3 inline-block bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-500/20">
                  Costo: 10 Bs por carpa
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">¿Listo para la aventura?</h2>
          <p className="text-slate-500 mb-6">El Jardín de las Delicias te espera.</p>
          <div className="inline-flex gap-2 items-center text-emerald-400 bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-800/50 text-sm">
            <MapPin className="h-4 w-4" /> El Torno, Santa Cruz, Bolivia
          </div>
        </div>

      </div>
    </div>
  );
}

// Pequeño componente auxiliar para el check
function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}