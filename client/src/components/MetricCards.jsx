import React from 'react';
import { 
  Package, 
  Clock, 
  Send, 
  AlertTriangle, 
  Hourglass, 
  Layers, 
  HelpCircle,
  TrendingUp 
} from 'lucide-react';

export default function MetricCards({ metrics = {}, activeFilter, onSelectFilter }) {
  const {
    totalOrders = 0,
    processingOrders = 0,
    dispatchedOrders = 0,
    potentiallyDelayedOrders = 0,
    staleTrackingCount = 0,
    conflictingStatusCount = 0,
    missingInfoCount = 0
  } = metrics;

  const coreCards = [
    {
      id: 'all',
      title: 'Total Orders',
      count: totalOrders,
      icon: Package,
      description: 'Active commercial orders',
      accentColor: 'indigo',
      activeBorder: 'border-indigo-500 ring-1 ring-indigo-500/50',
      badgeBg: 'bg-indigo-500/10 text-indigo-400',
      iconBg: 'bg-indigo-500/10 text-indigo-400'
    },
    {
      id: 'processing',
      title: 'Processing Orders',
      count: processingOrders,
      icon: Clock,
      description: 'Supplier packing & staging',
      accentColor: 'cyan',
      activeBorder: 'border-cyan-500 ring-1 ring-cyan-500/50',
      badgeBg: 'bg-cyan-500/10 text-cyan-400',
      iconBg: 'bg-cyan-500/10 text-cyan-400'
    },
    {
      id: 'dispatched',
      title: 'Dispatched Orders',
      count: dispatchedOrders,
      icon: Send,
      description: 'Carrier picked & transit linehaul',
      accentColor: 'emerald',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500/50',
      badgeBg: 'bg-emerald-500/10 text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'delayed',
      title: 'Potentially Delayed',
      count: potentiallyDelayedOrders,
      icon: AlertTriangle,
      description: 'ETA risk / SLA bottleneck',
      accentColor: 'rose',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500/50',
      badgeBg: 'bg-rose-500/10 text-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-400',
      urgent: potentiallyDelayedOrders > 0
    }
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* 4 Core Required Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreCards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectFilter(card.id)}
              className={`relative overflow-hidden cursor-pointer rounded-2xl bg-slate-900/90 border transition-all duration-200 p-5 ${
                isActive 
                  ? `${card.activeBorder} shadow-lg bg-slate-800/90` 
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/95'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                    {card.count}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {card.description}
                </span>
                {card.urgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 animate-pulse">
                    Action Req.
                  </span>
                )}
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* AI Intelligence Category Quick Filters (Task 4 Sub-filters) */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400 px-2 py-1 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          AI Intelligence Filters:
        </span>

        <button
          onClick={() => onSelectFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All ({totalOrders})
        </button>

        <button
          onClick={() => onSelectFilter('stale')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === 'stale'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Hourglass className="w-3.5 h-3.5" />
          Stale Updates ({staleTrackingCount})
        </button>

        <button
          onClick={() => onSelectFilter('delayed')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === 'delayed'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Delayed ETA ({potentiallyDelayedOrders})
        </button>

        <button
          onClick={() => onSelectFilter('conflicting')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === 'conflicting'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-400/90 hover:text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Status Conflicts ({conflictingStatusCount})
        </button>

        <button
          onClick={() => onSelectFilter('missing')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === 'missing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-400/90 hover:text-blue-300 hover:bg-blue-500/10'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Missing Info ({missingInfoCount})
        </button>
      </div>
    </div>
  );
}

