import { Layers, RefreshCw, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onAddLead?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isOnline?: boolean;
}

export default function Header({
  onAddLead,
  onRefresh,
  isRefreshing = false,
  isOnline = true,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Lead Manager
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 uppercase tracking-wide">
                  CRM
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Capture, qualify & accelerate sales opportunities
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* API Health Pill */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isOnline ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>API Online</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>API Disconnected</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh leads and statistics"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Add Lead CTA Button */}
            <button
              onClick={onAddLead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
