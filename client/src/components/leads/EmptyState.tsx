import { SearchX, UserPlus, WifiOff, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  isOffline?: boolean;
  onClearFilters?: () => void;
  onAddLead?: () => void;
  onRetry?: () => void;
}

export default function EmptyState({
  isFiltered,
  isOffline = false,
  onClearFilters,
  onAddLead,
  onRetry,
}: EmptyStateProps) {
  if (isOffline) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl mb-4 border border-amber-200/80 shadow-inner">
          <WifiOff className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Server Connection Unavailable
        </h3>

        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Could not retrieve leads from the backend API. Please check your network connection and click retry.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl mb-4 border border-slate-200/60 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {isFiltered ? 'No matching leads found' : 'No leads captured yet'}
      </h3>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {isFiltered
          ? 'Try adjusting your search criteria or clearing status and source filters to view more leads.'
          : 'Your sales pipeline is currently empty. Start capturing potential deals by adding your first lead.'}
      </p>

      <div className="flex items-center gap-3">
        {isFiltered && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        )}
        {onAddLead && (
          <button
            onClick={onAddLead}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        )}
      </div>
    </div>
  );
}
