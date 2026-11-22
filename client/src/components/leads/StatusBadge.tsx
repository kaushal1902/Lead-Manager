import type { LeadStatus } from '../../types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  New: {
    label: 'New Lead',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    dot: 'bg-blue-500',
  },
  Contacted: {
    label: 'Contacted',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    dot: 'bg-amber-500',
  },
  Qualified: {
    label: 'Qualified',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  Lost: {
    label: 'Lost',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.New;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
