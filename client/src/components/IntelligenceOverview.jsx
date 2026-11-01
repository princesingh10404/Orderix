import React from 'react';
import { 
  Sparkles, 
  Hourglass, 
  AlertOctagon, 
  SplitSquareVertical, 
  FileQuestion,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function IntelligenceOverview({ metrics = {}, onFilterSelect }) {
  const pillars = [
    {
      id: 'stale',
      title: 'Stale Tracking Updates',
      desc: 'Detects checkpoints with >36h or >60h scan silence',
      count: metrics.staleTrackingCount || 0,
      icon: Hourglass,
      color: 'amber',
      bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      tag: '> 36h silence'
    },
    {
      id: 'delayed',
      title: 'Potentially Delayed',
      desc: 'Flags overdue ETAs or high velocity delay bottlenecks',
      count: metrics.potentiallyDelayedOrders || 0,
      icon: AlertOctagon,
      color: 'rose',
      bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      tag: 'Past ETA / Stalled'
    },
    {
      id: 'conflicting',
      title: 'Conflicting Status Info',
      desc: 'Identifies mismatch between carrier header vs scan history',
      count: metrics.conflictingStatusCount || 0,
      icon: SplitSquareVertical,
      color: 'purple',
      bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      tag: 'State Desync'
    },
    {
      id: 'missing',
      title: 'Missing Delivery Info',
      desc: 'Flags incomplete ETAs, unassigned waybills or gaps',
      count: metrics.missingInfoCount || 0,
      icon: FileQuestion,
      color: 'blue',
      bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      tag: 'Telemetry Gaps'
    }
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Shipment Intelligence Module
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Rule & Heuristic Engine Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Continuously parsing structured TinyFish tracking JSON to pinpoint logistics anomalies before customers complain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time Risk Telemetry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              onClick={() => onFilterSelect(pillar.id)}
              className="group p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg border ${pillar.bgColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xl font-bold ${pillar.count > 0 ? 'text-white' : 'text-slate-500'}`}>
                    {pillar.count}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {pillar.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                  {pillar.tag}
                </span>
                <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                  Filter <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

