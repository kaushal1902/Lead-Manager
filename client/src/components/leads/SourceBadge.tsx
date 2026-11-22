import { Globe, Users2, Briefcase, Mail, Compass } from 'lucide-react';
import type { LeadSource } from '../../types/lead';

interface SourceBadgeProps {
  source: LeadSource;
}

const sourceLabels: Record<LeadSource, { label: string; icon: typeof Globe }> = {
  Website: { label: 'Website', icon: Globe },
  Referral: { label: 'Referral', icon: Users2 },
  LinkedIn: { label: 'LinkedIn', icon: Briefcase },
  Cold_Outreach: { label: 'Cold Outreach', icon: Mail },
  Other: { label: 'Other', icon: Compass },
};

export default function SourceBadge({ source }: SourceBadgeProps) {
  const info = sourceLabels[source] || { label: source, icon: Compass };
  const Icon = info.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
      <Icon className="w-3 h-3 text-slate-400" />
      <span>{info.label}</span>
    </span>
  );
}
