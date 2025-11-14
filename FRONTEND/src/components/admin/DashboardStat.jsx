import React from "react";

export function DashboardStat({ label, value, hint }) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-lg transition-colors hover:border-slate-600">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className="mt-1 text-3xl font-bold text-white">{value}</span>
      <span className="mt-1 text-xs text-slate-400">{hint}</span>
    </div>
  );
}