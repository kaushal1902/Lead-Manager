import { useEffect, useState, useCallback } from 'react';
import Header from './components/layout/Header';
import KpiCards from './components/dashboard/KpiCards';
import LeadTable from './components/leads/LeadTable';
import LeadToolbar, { type SortField, type SortOrder } from './components/leads/LeadToolbar';
import type { Lead, LeadStats, LeadStatus, LeadSource } from './types/lead';
import { getLeads, getLeadStats, checkApiHealth } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Load leads and metrics
  const loadData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      const [health, statsData, leadsData] = await Promise.all([
        checkApiHealth(),
        getLeadStats(),
        getLeads({
          search: debouncedSearch,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          source: sourceFilter !== 'All' ? sourceFilter : undefined,
          sortBy,
          order: sortOrder,
        }),
      ]);

      setIsOnline(health);
      setStats(statsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(async () => {
      const healthy = await checkApiHealth();
      setIsOnline(healthy);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusSelect = (status: LeadStatus | 'All') => {
    setStatusFilter(status);
  };

  const handleSourceSelect = (source: LeadSource | 'All') => {
    setSourceFilter(source);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSourceFilter('All');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'All' ||
    sourceFilter !== 'All' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  const handleAddLeadTrigger = () => {
    alert('Add Lead Modal will be introduced in Milestone 7.');
  };

  const handleEditLeadTrigger = (lead: Lead) => {
    alert(`Edit Lead for "${lead.name}" will be connected in Milestone 7.`);
  };

  const handleDeleteLeadTrigger = (lead: Lead) => {
    alert(`Delete confirmation modal for "${lead.name}" will be connected in Milestone 8.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        isOnline={isOnline}
        onAddLead={handleAddLeadTrigger}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Milestone Progress Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 mb-6 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>Milestone 6 Completed:</strong> Real-time Search, Status Filter Pills, Source Dropdown & Table Sorting.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
            Next: Add/Edit Lead Modal (M7)
          </span>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pipeline Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time summary of sales leads segmented by qualification status
            </p>
          </div>
        </div>

        {/* Status Summary KPI Cards (Milestone 4) */}
        <KpiCards
          stats={stats}
          activeStatusFilter={statusFilter}
          onSelectStatus={handleStatusSelect}
          isLoading={isLoading}
        />

        {/* Toolbar: Search, Filters & Sorting Controls (Milestone 6) */}
        <LeadToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={handleStatusSelect}
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceSelect}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          stats={stats}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={leads.length}
        />

        {/* Leads Data Table (Milestones 5 & 6) */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          isFiltered={hasActiveFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onClearFilters={handleResetFilters}
          onEditLead={handleEditLeadTrigger}
          onDeleteLead={handleDeleteLeadTrigger}
          onAddLead={handleAddLeadTrigger}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Lead Manager &bull; Screening Assignment for Meru Technosoft Pvt. Ltd.</span>
          <span>Express REST API + SQLite Prisma + React Vite + Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
