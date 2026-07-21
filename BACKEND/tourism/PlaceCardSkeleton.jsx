import React from 'react';

export default function PlaceCardSkeleton() {
  return (
    <div className="bg-cyan-900/30 rounded-2xl overflow-hidden shadow-lg border border-cyan-500/10 animate-pulse">
      <div className="h-56 w-full bg-slate-700"></div>
      <div className="p-5">
        <div className="h-6 w-3/4 bg-slate-700 rounded-md mb-3"></div>
        <div className="h-4 w-full bg-slate-700 rounded-md mb-2"></div>
        <div className="h-4 w-5/6 bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
}