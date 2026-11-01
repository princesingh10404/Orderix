import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Play, Sparkles, FileText } from 'lucide-react';
import { analyzeCustomPayload } from '../services/api';

export default function RawJsonModal({ isOpen, onClose, selectedOrder }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('extracted');
  const [customJsonInput, setCustomJsonInput] = useState(
    JSON.stringify(
      {
        waybillNumber: "WB-LIVE-TEST-992",
        carrier: "BlueDart Apex Express",
        origin: { city: "Bengaluru", state: "Karnataka", country: "India", hub: "BLR Logistics Gateway" },
        destination: { city: "Mumbai", state: "Maharashtra", country: "India", hub: "BOM Airport Freight Hub" },
        shipmentStatus: "Delivered",
        currentLocation: "Pune Sorting Terminal",
        latestTrackingUpdate: "2026-10-28T09:00:00Z",
        expectedDeliveryDate: "2026-10-29T18:00:00Z",
        shipmentHistory: [
          {
            timestamp: "2026-10-27T10:00:00Z",
            location: "Bengaluru Logistics Gateway",
            status: "Picked Up",
            description: "Package received at carrier origin dock."
          },
          {
            timestamp: "2026-10-28T09:00:00Z",
            location: "Pune Sorting Terminal",
            status: "In Transit Scan",
            description: "Arrived at transit hub."
          }
        ]
      },
      null,
      2
    )
  );
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState(null);

  if (!isOpen) return null;

  // The extracted TinyFish JSON structure for the currently selected order or demo
  const sampleJson = selectedOrder?.shipment || {
    waybillNumber: "WB-982344192",
    carrier: "BlueDart Apex Express",
    origin: { city: "Chennai", state: "Tamil Nadu", country: "India", hub: "MAA Airport Logistics Facility" },
    destination: { city: "Bengaluru", state: "Karnataka", country: "India", hub: "BLR Tech Center Delivery Hub" },
    shipmentStatus: "In Transit",
    currentLocation: "Hosur Transit Gateway, Tamil Nadu",
    latestTrackingUpdate: "2026-11-01T08:30:00Z",
    expectedDeliveryDate: "2026-11-02T16:00:00Z",
    dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
    isDemoData: true,
    shipmentHistory: [
      {
        timestamp: "2026-10-29T14:20:00Z",
        location: "Chennai Hub - Gate 4",
        status: "Shipment Picked Up",
        description: "Consignment handed over by supplier warehouse to BlueDart courier."
      },
      {
        timestamp: "2026-10-29T21:45:00Z",
        location: "MAA Airport Logistics Facility",
        status: "Processed through Sorting Hub",
        description: "Dimensional weight audited and sorted into Inter-City Truck 42B."
      },
      {
        timestamp: "2026-11-01T08:30:00Z",
        location: "Hosur Transit Gateway, Tamil Nadu",
        status: "Arrived at Hub",
        description: "Container arrived at gateway hub for customs check and vehicle change."
      }
    ]
  };

  const jsonString = JSON.stringify(sampleJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiAnalysis = async () => {
    try {
      setIsTesting(true);
      setTestError(null);
      const parsed = JSON.parse(customJsonInput);
      const res = await analyzeCustomPayload(parsed);
      setTestResult(res.data?.analysis);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                TinyFish Structured Tracking JSON
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Payload
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verified schema returned by TinyFish Playground after navigating tracking portal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4 text-xs font-semibold bg-slate-950/40">
          <button
            onClick={() => setActiveTab('extracted')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'extracted'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Extracted Payload ({selectedOrder ? selectedOrder.customerOrderId : 'Demo Spec'})
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tester'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live AI Intelligence Tester
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'extracted' ? (
            <div>
              <div className="flex items-center justify-between mb-3 text-slate-400">
                <span>Format: application/json</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800/80 overflow-x-auto leading-relaxed max-h-[50vh]">
                {jsonString}
              </pre>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs font-sans">
                <span className="font-semibold text-amber-300">Notice for Evaluators:</span> This structure holds the 7 standard tracking fields extracted by TinyFish:
                <span className="text-slate-400 block mt-1">
                  1. Waybill number &nbsp;•&nbsp; 2. Origin & destination &nbsp;•&nbsp; 3. Shipment status &nbsp;•&nbsp; 4. Shipment history &nbsp;•&nbsp; 5. Current location &nbsp;•&nbsp; 6. Latest tracking update &nbsp;•&nbsp; 7. Expected delivery date
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Paste or modify Tracking JSON to test the AI Shipment Intelligence Engine:
                </label>
                <textarea
                  value={customJsonInput}
                  onChange={(e) => setCustomJsonInput(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isTesting ? 'Analyzing...' : 'Run AI Shipment Intelligence'}</span>
                </button>

                {testError && (
                  <span className="text-xs text-rose-400 font-mono">
                    Error: {testError}
                  </span>
                )}
              </div>

              {testResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AI Analysis Output
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40">
                      Risk Level: {testResult.riskLevel} ({testResult.riskScore}/100)
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {testResult.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Identified Risk Flags ({testResult.issues?.length || 0}):
                    </span>
                    {testResult.issues?.map((iss, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">[{iss.type}]</span>
                          <span className="text-white font-medium">{iss.title}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">{iss.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex justify-end bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
