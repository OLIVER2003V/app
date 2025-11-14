import React from "react";

export function DashboardCard({ icon, title, desc, children }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
      
      {/* Encabezado de la tarjeta */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex-shrink-0 rounded-lg bg-blue-500/10 p-2.5 text-blue-400 ring-1 ring-blue-500/20">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{desc}</p>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-700 px-5 py-4">
        {children}
      </div>
    </div>
  );
}