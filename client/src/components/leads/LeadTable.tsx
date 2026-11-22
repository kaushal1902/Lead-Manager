import { Building2, Phone, Mail, Pencil, Trash2, Calendar, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { Lead, LeadStatus, PaginationMeta } from '../../types/lead';
import type { SortField, SortOrder } from './LeadToolbar';
import StatusBadge from './StatusBadge';
import SourceBadge from './SourceBadge';
import TableSkeleton from './TableSkeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

interface LeadTableProps {
  leads: Lead[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isFiltered: boolean;
  isOffline?: boolean;
  isGuest?: boolean;
  onRequireAuth?: () => void;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  onSortChange?: (field: SortField, order: SortOrder) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onClearFilters?: () => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
  onQuickStatusChange?: (lead: Lead, newStatus: LeadStatus) => void;
  onAddLead?: () => void;
  onRetry?: () => void;
}

export default function LeadTable({
  leads,
  pagination,
  isLoading,
  isFiltered,
  isOffline = false,
  isGuest = false,
  onRequireAuth,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  onPageChange,
  onLimitChange,
  onClearFilters,
  onEditLead,
  onDeleteLead,
  onQuickStatusChange,
  onAddLead,
  onRetry,
}: LeadTableProps) {
  // Format Date (e.g. Nov 22, 2026)
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleColumnSort = (field: SortField) => {
    if (!onSortChange) return;
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Loading Skeletons */}
      {isLoading ? (
        <TableSkeleton rows={pagination.limit || 6} />
      ) : leads.length === 0 ? (
        <EmptyState
          isFiltered={isFiltered}
          isOffline={isOffline}
          onClearFilters={onClearFilters}
          onAddLead={onAddLead}
          onRetry={onRetry}
        />
      ) : (
        <>
          {/* ======================================================== */}
          {/* DESKTOP / TABLET VIEW (Visible on screens >= md: 768px) */}
          {/* ======================================================== */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
                  {/* Lead / Contact Header */}
                  <th className="py-3.5 px-6">
                    <button
                      onClick={() => handleColumnSort('name')}
                      className="flex items-center gap-1.5 hover:text-slate-900 group/th transition-colors cursor-pointer"
                    >
                      <span>Lead / Contact</span>
                      {renderSortIcon('name')}
                    </button>
                  </th>

                  {/* Company Header */}
                  <th className="py-3.5 px-6">
                    <button
                      onClick={() => handleColumnSort('company')}
                      className="flex items-center gap-1.5 hover:text-slate-900 group/th transition-colors cursor-pointer"
                    >
                      <span>Company</span>
                      {renderSortIcon('company')}
                    </button>
                  </th>

                  {/* Phone Header */}
                  <th className="py-3.5 px-6">Phone</th>

                  {/* Source Header */}
                  <th className="py-3.5 px-6">Source</th>

                  {/* Status Header */}
                  <th className="py-3.5 px-6">
                    <button
                      onClick={() => handleColumnSort('status')}
                      className="flex items-center gap-1.5 hover:text-slate-900 group/th transition-colors cursor-pointer"
                    >
                      <span>Status</span>
                      {renderSortIcon('status')}
                    </button>
                  </th>

                  {/* Created Date Header */}
                  <th className="py-3.5 px-6 hidden xl:table-cell">
                    <button
                      onClick={() => handleColumnSort('createdAt')}
                      className="flex items-center gap-1.5 hover:text-slate-900 group/th transition-colors cursor-pointer"
                    >
                      <span>Added</span>
                      {renderSortIcon('createdAt')}
                    </button>
                  </th>

                  {/* Actions Header */}
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/75 transition-colors duration-100 group"
                  >
                    {/* Lead Info (Name & Email) */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                          {getInitials(lead.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {lead.name}
                          </div>
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-xs text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 mt-0.5 truncate"
                            title={lead.email}
                          >
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-6">
                      {lead.company ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-6">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-normal"
                        >
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{lead.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-6">
                      <SourceBadge source={lead.source} />
                    </td>

                    {/* Status Badge with Quick Changer */}
                    <td className="py-3.5 px-6">
                      <div
                        className="relative inline-flex items-center group/badge cursor-pointer"
                        title={isGuest ? "Sign in to update lead status" : "Click badge to quick-change status"}
                        onMouseDown={(e) => {
                          if (isGuest) {
                            e.preventDefault();
                            e.stopPropagation();
                            onRequireAuth?.();
                          }
                        }}
                      >
                        <StatusBadge status={lead.status} />
                        <select
                          value={lead.status}
                          disabled={isGuest}
                          onChange={(e) => onQuickStatusChange?.(lead, e.target.value as LeadStatus)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-pointer"
                        >
                          <option value="New">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Lost">Lost / Closed</option>
                        </select>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-6 hidden xl:table-cell text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditLead?.(lead)}
                          title="Edit lead"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLead?.(lead)}
                          title="Delete lead"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ======================================================== */}
          {/* MOBILE CARD VIEW (Optimized for small screens < 768px)   */}
          {/* ======================================================== */}
          <div className="md:hidden divide-y divide-slate-100">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-3">
                {/* Header: Name, Avatar, and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                      {getInitials(lead.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{lead.company}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div
                    className="relative inline-flex items-center cursor-pointer"
                    onMouseDown={(e) => {
                      if (isGuest) {
                        e.preventDefault();
                        e.stopPropagation();
                        onRequireAuth?.();
                      }
                    }}
                  >
                    <StatusBadge status={lead.status} size="sm" />
                    <select
                      value={lead.status}
                      disabled={isGuest}
                      onChange={(e) => onQuickStatusChange?.(lead, e.target.value as LeadStatus)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-pointer"
                      title={isGuest ? "Sign in to update lead status" : "Quick update status"}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                {/* Contact Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>

                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 truncate"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                {/* Footer: Source, Date, and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={lead.source} />
                    <span className="text-[11px] text-slate-400">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLead?.(lead)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLead?.(lead)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer with Pagination Controls */}
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
