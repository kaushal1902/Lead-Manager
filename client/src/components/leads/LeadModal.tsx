import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, AlertCircle, Loader2 } from 'lucide-react';
import type { Lead, CreateLeadInput, LeadStatus, LeadSource } from '../../types/lead';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadInput) => Promise<void>;
  initialData?: Lead | null;
  isSubmitting?: boolean;
}

export default function LeadModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: LeadModalProps) {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<CreateLeadInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    notes: '',
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});

  // Sync initial data when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || '',
        company: initialData.company || '',
        source: initialData.source,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        status: 'New',
        notes: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Validate fields
  const validateField = (field: 'name' | 'email', value: string): string | undefined => {
    if (field === 'name') {
      const trimmed = value.trim();
      if (!trimmed) return 'Full name is required';
      if (trimmed.length < 2) return 'Name must be at least 2 characters';
      if (trimmed.length > 100) return 'Name must not exceed 100 characters';
    }
    if (field === 'email') {
      const trimmed = value.trim();
      if (!trimmed) return 'Email address is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
    }
    return undefined;
  };

  const handleChange = (
    field: keyof CreateLeadInput,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'name' || field === 'email') {
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleBlur = (field: 'name' | 'email') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);

    if (nameError || emailError) {
      setErrors({ name: nameError, email: emailError });
      setTouched({ name: true, email: true });
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Dialog Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Lead' : 'Add New Lead'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? 'Update contact information and sales status'
                : 'Capture a new sales opportunity into the pipeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name & Email (2 columns on sm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border rounded-lg focus:outline-none transition-all ${
                    errors.name && touched.name
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.name && touched.name && (
                <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="alex@company.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border rounded-lg focus:outline-none transition-all ${
                    errors.email && touched.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Apex Cloud Corp"
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value as LeadSource)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
              >
                <option value="Website">Website Inbound</option>
                <option value="Referral">Client Referral</option>
                <option value="LinkedIn">LinkedIn Outreach</option>
                <option value="Cold_Outreach">Cold Email / Call</option>
                <option value="Other">Other Channel</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pipeline Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as LeadStatus)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
              >
                <option value="New">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost / Closed</option>
              </select>
            </div>
          </div>

          {/* Discovery Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sales Notes & Requirements
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add discovery details, budget info, timeline, or pain points..."
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditMode ? 'Save Changes' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
