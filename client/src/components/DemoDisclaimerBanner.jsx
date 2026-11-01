import React from 'react';
import { Radio, Cpu } from 'lucide-react';

export default function DemoDisclaimerBanner({ onOpenPayloadModal }) {
  return (
    <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent border-y sm:border border-cyan-500/20 sm:rounded-xl px-4 py-3 sm:px-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-cyan-200 text-sm">TinyFish Live Integration Active</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Parcel Perfect Sandbox Ready
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">
                • Tested & Verified with Waybill #1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live web agent extraction connected via official TinyFish API. Orders can be synced live from public tracking portals or tested against pre-loaded test datasets.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onOpenPayloadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            Inspect Extracted JSON
          </button>
        </div>
      </div>
    </div>
  );
}
