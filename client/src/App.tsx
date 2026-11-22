import { useEffect, useState, useCallback } from 'react';
import Header from './components/layout/Header';
import OfflineBanner from './components/common/OfflineBanner';
import KpiCards from './components/dashboard/KpiCards';
import LeadTable from './components/leads/LeadTable';
import LeadToolbar, { type SortField, type SortOrder } from './components/leads/LeadToolbar';
import LeadModal from './components/leads/LeadModal';
import DeleteConfirmModal from './components/leads/DeleteConfirmModal';
import AuthModal from './components/auth/AuthModal';
import Toast, { type ToastMessage } from './components/common/Toast';
import type { Lead, LeadStats, LeadStatus, LeadSource, CreateLeadInput, PaginationMeta } from './types/lead';
import type { User } from './types/auth';
import {
  getLeads,
  getLeadStats,
  checkApiHealth,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from './services/api';
import { fetchCurrentUser, clearAuthSession, getStoredUser } from './services/auth';
import { useDebounce } from './hooks/useDebounce';
import { Sparkles, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Authentication State (Bonus Feature)
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal State
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

  // Check auth on mount
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setCurrentUser(user);
    });
  }, []);

  // Load leads and metrics
  const loadData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      const [health, statsData, response] = await Promise.all([
        checkApiHealth(),
        getLeadStats(),
        getLeads({
          search: debouncedSearch,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          source: sourceFilter !== 'All' ? sourceFilter : undefined,
          sortBy,
          order: sortOrder,
          page,
          limit,
        }),
      ]);

      setIsOnline(health);
      setStats(statsData);
      setLeads(response.leads);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setIsOnline(false);
      showToast('Backend API is disconnected. Please check port 5000.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder, page, limit, showToast]);

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
    setPage(1);
  };

  const handleSourceSelect = (source: LeadSource | 'All') => {
    setSourceFilter(source);
    setPage(1);
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
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'All' ||
    sourceFilter !== 'All' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.name}`, 'success');
    setPage(1);
    loadData();
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    showToast('Signed out. Switched to Guest Mode.', 'info');
    setPage(1);
    loadData();
  };

  const handleGuestMode = () => {
    clearAuthSession();
    setCurrentUser(null);
    setIsAuthModalOpen(false);
    showToast('Browsing as Guest. Viewing all pipeline leads.', 'info');
    setPage(1);
    loadData();
  };

  // Add / Edit Modal Handlers
  const handleOpenAddModal = () => {
    if (!currentUser) {
      showToast('Please sign in to add a new lead.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    if (!currentUser) {
      showToast('Please sign in to edit or update leads.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (lead: Lead) => {
    if (!currentUser) {
      showToast('Please sign in to delete leads.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setLeadToDelete(lead);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete Action with Optimistic UI
  const handleConfirmDelete = async () => {
    if (!currentUser) {
      showToast('Please sign in to delete leads.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    if (!leadToDelete) return;
    const previousLeads = [...leads];
    const previousStats = stats;

    setIsDeleting(true);
    setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));

    try {
      await deleteLead(leadToDelete.id);
      showToast(`Lead "${leadToDelete.name}" permanently deleted.`, 'success');
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);

      const updatedStats = await getLeadStats();
      setStats(updatedStats);
      loadData();
    } catch (err: unknown) {
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
    if (!currentUser) {
      showToast('Please sign in to update lead status.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    if (lead.status === newStatus) return;

    const previousLeads = [...leads];
    const previousStats = stats;

    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );

    try {
      await updateLeadStatus(lead.id, newStatus);
      showToast(`Updated "${lead.name}" status to ${newStatus}.`, 'info');

      const updatedStats = await getLeadStats();
      setStats(updatedStats);
    } catch (err: unknown) {
      setLeads(previousLeads);
      setStats(previousStats);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
      showToast(errorMsg, 'error');
    }
  };

  // Form Submit Handler
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
      {/* Top Navigation Header with User Profile / Auth Toggle */}
      <Header
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        isOnline={isOnline}
        onAddLead={handleOpenAddModal}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Offline Alert Banner */}
      <OfflineBanner
        isOnline={isOnline}
        onRetry={() => loadData(true)}
        isRetrying={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Scope / Multi-tenant Context Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs mb-6 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${currentUser ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
              {currentUser ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-semibold text-slate-900">
                {currentUser ? `Signed in as ${currentUser.name}` : 'Guest / Demo Mode'}
              </span>
              <span className="mx-2 text-slate-300">&bull;</span>
              <span className="text-slate-500">
                {currentUser
                  ? 'Showing your isolated personal leads'
                  : 'Viewing global pipeline. Sign in to test user-specific lead isolation.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
              >
                Switch Account
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Test 1-Click Reviewer Logins</span>
              </button>
            )}
          </div>
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

        {/* Status Summary KPI Cards */}
        <KpiCards
          stats={stats}
          activeStatusFilter={statusFilter}
          onSelectStatus={handleStatusSelect}
          isLoading={isLoading}
        />

        {/* Toolbar: Search, Filters & Sorting Controls */}
        <LeadToolbar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
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
          totalFilteredCount={pagination.total}
        />

        {/* Leads Data Table with Desktop Table, Mobile Cards & Pagination */}
        <LeadTable
          leads={leads}
          pagination={pagination}
          isLoading={isLoading}
          isFiltered={hasActiveFilters}
          isOffline={!isOnline}
          isGuest={!currentUser}
          onRequireAuth={() => {
            showToast('Please sign in to edit or update leads.', 'info');
            setIsAuthModalOpen(true);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onClearFilters={handleResetFilters}
          onEditLead={handleOpenEditModal}
          onDeleteLead={handleOpenDeleteModal}
          onQuickStatusChange={handleQuickStatusChange}
          onAddLead={handleOpenAddModal}
          onRetry={() => loadData(true)}
        />
      </main>

      {/* Add / Edit Lead Modal */}
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

      {/* Delete Confirmation Modal */}
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

      {/* Auth Modal (Sign In / Sign Up / 1-Click Demo Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onGuestMode={handleGuestMode}
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
