import { Search, X, ArrowUp, ArrowDown, Filter, RotateCcw } from 'lucide-react';
import type { LeadStatus, LeadSource, LeadStats } from '../../types/lead';

export type SortField = 'createdAt' | 'name' | 'status' | 'company';
export type SortOrder = 'asc' | 'desc';

interface LeadToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeadStatus | 'All';
  onStatusChange: (status: LeadStatus | 'All') => void;
  sourceFilter: LeadSource | 'All';
  onSourceChange: (source: LeadSource | 'All') => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  stats: LeadStats | null;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount: number;
}

export default function LeadToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  sortBy,
  sortOrder,
  onSortChange,
  stats,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount,
}: LeadToolbarProps) {
  const statusPills: Array<{ id: LeadStatus | 'All'; label: string; count?: number }> = [
    { id: 'All', label: 'All', count: stats?.total },
    { id: 'New', label: 'New', count: stats?.new },
    { id: 'Contacted', label: 'Contacted', count: stats?.contacted },
    { id: 'Qualified', label: 'Qualified', count: stats?.qualified },
    { id: 'Lost', label: 'Lost', count: stats?.lost },
  ];

  const sourceOptions: Array<{ id: LeadSource | 'All'; label: string }> = [
    { id: 'All', label: 'All Sources' },
    { id: 'Website', label: 'Website' },
    { id: 'Referral', label: 'Referral' },
    { id: 'LinkedIn', label: 'LinkedIn' },
    { id: 'Cold_Outreach', label: 'Cold Outreach' },
    { id: 'Other', label: 'Other' },
  ];

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads by name, email, or company..."
            className="w-full pl-9 pr-9 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Source Filter, Sort Dropdown & Reset */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Source Dropdown */}
          <div className="relative inline-flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={sourceFilter}
              onChange={(e) => onSourceChange(e.target.value as LeadSource | 'All')}
              className="pl-8 pr-7 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all cursor-pointer appearance-none"
            >
              {sourceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Field Selector */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
              className="py-2 pl-3 pr-2 text-xs font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Lead Name</option>
              <option value="status">Status</option>
              <option value="company">Company</option>
            </select>
            <button
              onClick={toggleSortOrder}
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'} (Click to toggle)`}
              className="px-2 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l border-slate-200 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all active search and filter criteria"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Pills Sub-bar */}
      <div className="flex items-center justify-between border-t border-slate-200/50 pt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">
            Status:
          </span>
          {statusPills.map((pill) => {
            const isSelected = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => onStatusChange(pill.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{pill.label}</span>
                {pill.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Filter Count Indicator */}
        <div className="text-xs text-slate-500 whitespace-nowrap hidden sm:block">
          Found <strong className="font-semibold text-slate-800">{totalFilteredCount}</strong> leads
        </div>
      </div>
    </div>
  );
}
