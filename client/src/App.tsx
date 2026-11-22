import { useEffect, useState, useCallback } from 'react';
import Header from './components/layout/Header';
import KpiCards from './components/dashboard/KpiCards';
import LeadTable from './components/leads/LeadTable';
import LeadToolbar, { type SortField, type SortOrder } from './components/leads/LeadToolbar';
import LeadModal from './components/leads/LeadModal';
import DeleteConfirmModal from './components/leads/DeleteConfirmModal';
import Toast, { type ToastMessage } from './components/common/Toast';
import type { Lead, LeadStats, LeadStatus, LeadSource, CreateLeadInput } from './types/lead';
import {
  getLeads,
  getLeadStats,
  checkApiHealth,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from './services/api';
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

  // Add / Edit Modal State (Milestone 7)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal State (Milestone 8)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Floating Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
      showToast('Could not sync data with server. Check API connection.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder, showToast]);

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

  // Add Lead Trigger
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  // Edit Lead Trigger
  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  // Delete Lead Trigger (Milestone 8)
  const handleOpenDeleteModal = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete Action with Optimistic UI
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    const previousLeads = [...leads];
    const previousStats = stats;

    setIsDeleting(true);

    // Optimistic UI removal
    setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));

    try {
      await deleteLead(leadToDelete.id);
      showToast(`Lead "${leadToDelete.name}" permanently deleted.`, 'success');
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);

      // Refresh KPI statistics
      const updatedStats = await getLeadStats();
      setStats(updatedStats);
    } catch (err: unknown) {
      // Rollback on failure
      setLeads(previousLeads);
      setStats(previousStats);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete lead';
      showToast(errorMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Status Update with Optimistic UI
  const handleQuickStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (lead.status === newStatus) return;

    const previousLeads = [...leads];
    const previousStats = stats;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );

    try {
      await updateLeadStatus(lead.id, newStatus);
      showToast(`Updated "${lead.name}" status to ${newStatus}.`, 'info');

      // Refresh KPI statistics
      const updatedStats = await getLeadStats();
      setStats(updatedStats);
    } catch (err: unknown) {
      // Rollback on failure
      setLeads(previousLeads);
      setStats(previousStats);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
      showToast(errorMsg, 'error');
    }
  };

  // Form Submit Handler (Add / Edit)
  const handleFormSubmit = async (formData: CreateLeadInput) => {
    setIsSubmitting(true);
    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
        showToast(`Lead "${formData.name}" updated successfully!`, 'success');
      } else {
        await createLead(formData);
        showToast(`Lead "${formData.name}" added to pipeline!`, 'success');
      }

      setIsModalOpen(false);
      setEditingLead(null);
      await loadData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while saving lead.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        isOnline={isOnline}
        onAddLead={handleOpenAddModal}
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
              <strong>Milestone 8 Completed:</strong> Custom Delete Confirmation Modal with Optimistic State Rollback.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
            Next: Offline Fallback & Mobile Polish (M9)
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

        {/* Leads Data Table (Milestones 5, 6, 7 & 8) */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          isFiltered={hasActiveFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onClearFilters={handleResetFilters}
          onEditLead={handleOpenEditModal}
          onDeleteLead={handleOpenDeleteModal}
          onQuickStatusChange={handleQuickStatusChange}
          onAddLead={handleOpenAddModal}
        />
      </main>

      {/* Add / Edit Lead Modal (Milestone 7) */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingLead}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal (Milestone 8) */}
      <DeleteConfirmModal
        isOpen={isDeleteDialogOpen}
        lead={leadToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setLeadToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

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
