import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-1/3 border-r border-slate-200 bg-white flex flex-col h-full">
        <div className="h-48 w-full bg-slate-200" />
        <div className="p-6 flex-1 space-y-6">
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-16 bg-slate-100 rounded-lg w-full" />
                  <div className="h-16 bg-slate-100 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Map Skeleton */}
      <div className="hidden md:block flex-1 bg-slate-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-400 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};
