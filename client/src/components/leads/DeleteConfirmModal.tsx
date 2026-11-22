import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Lead } from '../../types/lead';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
        <div className="flex items-start gap-4">
          {/* Warning Icon Badge */}
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Confirmation Message */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Delete Lead
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="font-semibold text-slate-900 break-words">
                "{lead.name}"
              </strong>{' '}
              {lead.company ? (
                <>from <span className="font-medium text-slate-800">{lead.company}</span></>
              ) : null}?
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-2">
              This action cannot be undone and will remove all associated sales notes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isDeleting ? 'Deleting...' : 'Delete Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
