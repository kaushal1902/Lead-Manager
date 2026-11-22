export default function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3.5 bg-slate-100 rounded w-1/6 hidden sm:block" />
          <div className="h-3.5 bg-slate-100 rounded w-1/6 hidden md:block" />
          <div className="h-5 bg-slate-200 rounded-full w-20" />
          <div className="h-3.5 bg-slate-100 rounded w-20 hidden lg:block" />
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-slate-100 rounded" />
            <div className="w-7 h-7 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
