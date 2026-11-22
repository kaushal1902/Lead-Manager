import { Users, Sparkles, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import type { LeadStats, LeadStatus } from '../../types/lead';

interface KpiCardsProps {
  stats: LeadStats | null;
  activeStatusFilter: LeadStatus | 'All';
  onSelectStatus: (status: LeadStatus | 'All') => void;
  isLoading?: boolean;
}

export default function KpiCards({
  stats,
  activeStatusFilter,
  onSelectStatus,
  isLoading = false,
}: KpiCardsProps) {
  const total = stats?.total || 0;

  const cards: Array<{
    id: LeadStatus | 'All';
    label: string;
    count: number;
    icon: typeof Users;
    iconBg: string;
    iconColor: string;
    borderActive: string;
    bgActive: string;
  }> = [
    {
      id: 'All',
      label: 'Total Leads',
      count: total,
      icon: Users,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-500/10',
      bgActive: 'bg-indigo-50/20',
    },
    {
      id: 'New',
      label: 'New Leads',
      count: stats?.new || 0,
      icon: Sparkles,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderActive: 'border-blue-500 ring-2 ring-blue-500/10',
      bgActive: 'bg-blue-50/20',
    },
    {
      id: 'Contacted',
      label: 'Contacted',
      count: stats?.contacted || 0,
      icon: PhoneCall,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/10',
      bgActive: 'bg-amber-50/20',
    },
    {
      id: 'Qualified',
      label: 'Qualified',
      count: stats?.qualified || 0,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/10',
      bgActive: 'bg-emerald-50/20',
    },
    {
      id: 'Lost',
      label: 'Lost / Closed',
      count: stats?.lost || 0,
      icon: XCircle,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      borderActive: 'border-slate-500 ring-2 ring-slate-500/10',
      bgActive: 'bg-slate-100/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.id;
        const percentage = total > 0 && card.id !== 'All' 
          ? Math.round((card.count / total) * 100) 
          : null;

        return (
          <button
            key={card.id}
            onClick={() => onSelectStatus(card.id)}
            disabled={isLoading}
            className={`flex flex-col text-left p-4 rounded-xl bg-white border transition-all duration-150 relative overflow-hidden group shadow-sm hover:shadow-md ${
              isActive
                ? `${card.borderActive} ${card.bgActive}`
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg} ${card.iconColor} transition-transform group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded my-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {card.count}
                </span>
                {percentage !== null && (
                  <span className="text-[11px] font-medium text-slate-400">
                    {percentage}% of total
                  </span>
                )}
              </div>
            )}

            {/* Bottom active indicator line */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-80" />
            )}
          </button>
        );
      })}
    </div>
  );
}
