import React from "react";

export function DashboardCard({ title, icon, desc, children }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-5 shadow-sm transition-all hover:border-slate-700 hover:bg-slate-800 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
      
      <div className="flex flex-col gap-2 mt-auto">
        {children}
      </div>
    </div>
  );
}