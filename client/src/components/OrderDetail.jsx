import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  Calendar, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Hourglass, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  FileCode, 
  Copy, 
  Check,
  Info,
  RefreshCw,
  Loader2,
  Cpu,
  Radio
} from 'lucide-react';
import { trackLiveWithTinyFish } from '../services/api';

export default function OrderDetail({ order, onBack, onOpenJsonModal, onOrderUpdated }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [copiedWaybill, setCopiedWaybill] = useState(false);
  const [activeIntelTab, setActiveIntelTab] = useState('all');
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [liveSyncError, setLiveSyncError] = useState(null);
  const [liveSyncSuccess, setLiveSyncSuccess] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  if (!currentOrder) return null;

  const intel = currentOrder.intelligence || {};
  const shipment = currentOrder.shipment || {};
  const history = shipment.shipmentHistory || [];
  const issues = intel.issues || [];
  const isLive = shipment.isDemoData === false || Boolean(shipment.liveRunMeta);

  const handleCopyWaybill = () => {
    if (shipment.waybillNumber) {
      navigator.clipboard.writeText(shipment.waybillNumber);
      setCopiedWaybill(true);
      setTimeout(() => setCopiedWaybill(false), 2000);
    }
  };

  const handleSyncLive = async () => {
    try {
      setIsLiveSyncing(true);
      setLiveSyncError(null);
      setLiveSyncSuccess(false);

      const res = await trackLiveWithTinyFish({
        waybillNumber: shipment.waybillNumber || '1',
        trackingUrl: shipment.carrierTrackingUrl || 'https://parcelperfect.com/tracking-demo/',
        carrier: shipment.carrier || 'Parcel Perfect Express',
        orderId: currentOrder.id
      });

      if (res.success && res.data?.order) {
        setCurrentOrder(res.data.order);
        if (onOrderUpdated) onOrderUpdated(res.data.order);
        setLiveSyncSuccess(true);
        setTimeout(() => setLiveSyncSuccess(false), 4000);
      }
    } catch (err) {
      setLiveSyncError(err.message || 'Live TinyFish execution failed.');
    } finally {
      setIsLiveSyncing(false);
    }
  };

  // Filter issues by category tab
  const filteredIssues = activeIntelTab === 'all' 
    ? issues 
    : issues.filter(i => {
        if (activeIntelTab === 'stale') return i.type === 'STALE_UPDATE';
        if (activeIntelTab === 'delayed') return i.type === 'POTENTIALLY_DELAYED';
        if (activeIntelTab === 'conflicting') return i.type === 'CONFLICTING_STATUS';
        if (activeIntelTab === 'missing') return i.type === 'MISSING_INFO';
        return true;
      });

  // Risk styling
  let riskGradient = 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400';
  let riskBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (intel.riskLevel === 'CRITICAL') {
    riskGradient = 'from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/40 text-rose-300';
    riskBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
  } else if (intel.riskLevel === 'HIGH') {
    riskGradient = 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/40 text-amber-300';
    riskBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (intel.riskLevel === 'MEDIUM') {
    riskGradient = 'from-yellow-500/20 via-yellow-500/10 to-transparent border-yellow-500/30 text-yellow-300';
    riskBadge = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </div>
          <span>Back to Order Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live TinyFish Sync Button */}
          <button
            onClick={handleSyncLive}
            disabled={isLiveSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isLiveSyncing
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse cursor-wait'
                : isLive
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {isLiveSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>TinyFish Agent Navigating Portal...</span>
              </>
            ) : (
              <>
                <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-cyan-300 animate-ping' : ''}`} />
                <span>{isLive ? 'Re-Sync Live with TinyFish' : 'Track Live with TinyFish'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenJsonModal(currentOrder)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Inspect Extracted JSON</span>
          </button>
        </div>
      </div>

      {/* Sync Success / Error Alerts */}
      {liveSyncSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>TinyFish Extraction Verified:</strong> Live shipment tracking telemetry pulled from {shipment.carrierTrackingUrl} ({shipment.liveRunMeta?.durationSeconds || 0}s execution, {shipment.liveRunMeta?.stepsCount || 0} steps).
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400/80">LIVE MODE</span>
        </div>
      )}

      {liveSyncError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>TinyFish Live Agent Error: {liveSyncError}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {currentOrder.customerOrderId}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Supplier ID: {currentOrder.supplierOrderId}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                currentOrder.orderStatus.toLowerCase() === 'delivered'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : currentOrder.orderStatus.toLowerCase() === 'dispatched'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {currentOrder.orderStatus}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">
                {currentOrder.priority} Priority
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Ordered: {new Date(currentOrder.orderDate).toLocaleString()}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-medium">
                Value: {currentOrder.totalAmount}
              </span>
              <span>•</span>
              {isLive ? (
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  LIVE TINYFISH VERIFIED (Run #{shipment.liveRunMeta?.runId?.slice(0, 8) || 'live'})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400/90">
                  <Info className="w-3.5 h-3.5" />
                  Demo Dataset (Sandbox Sandbox Test Mode)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-4 rounded-xl border ${riskGradient} flex items-center gap-3.5`}>
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  AI Shipment Risk
                </p>
                <div className="text-2xl font-black tracking-tight mt-0.5">
                  {intel.riskScore}<span className="text-sm font-normal text-slate-400">/100</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${riskBadge}`}>
                {intel.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI SHIPMENT INTELLIGENCE MODULE REPORT (TASK 4) */}
      <div className={`rounded-2xl border ${riskGradient} bg-slate-900/95 p-6 shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  AI Shipment Intelligence Diagnostic
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isLive ? 'Live Analysis' : 'Pre-Integration Rule Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates extracted tracking JSON against 4 operational risk vectors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Analyzed Reference:</span>
            <span className="font-mono text-slate-300">
              {intel.analyzedAt ? new Date(intel.analyzedAt).toLocaleTimeString() : 'Active'}
            </span>
          </div>
        </div>

        {/* AI Synthesis Summary */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Automated Synthesis
          </p>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            {intel.summary}
          </p>
        </div>

        {/* Category breakdown filter buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveIntelTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeIntelTab === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            All Findings ({issues.length})
          </button>
          
          <button
            onClick={() => setActiveIntelTab('stale')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeIntelTab === 'stale' 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-800/70 text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            Stale Updates ({intel.categoryCounts?.staleUpdates || 0})
          </button>

          <button
            onClick={() => setActiveIntelTab('delayed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeIntelTab === 'delayed' 
                ? 'bg-rose-600 text-white' 
                : 'bg-slate-800/70 text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Potential Delays ({intel.categoryCounts?.potentialDelays || 0})
          </button>

          <button
            onClick={() => setActiveIntelTab('conflicting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeIntelTab === 'conflicting' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800/70 text-purple-400/80 hover:text-purple-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Conflicting Status ({intel.categoryCounts?.conflictingStatus || 0})
          </button>

          <button
            onClick={() => setActiveIntelTab('missing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeIntelTab === 'missing' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800/70 text-blue-400/80 hover:text-blue-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Missing Info ({intel.categoryCounts?.missingInfo || 0})
          </button>
        </div>

        {/* Detailed Issues List */}
        <div className="mt-4 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No active anomalies detected in this category. Shipment telemetry conforms with operational SLA.</span>
            </div>
          ) : (
            filteredIssues.map((issue, idx) => {
              let issueBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              if (issue.severity === 'HIGH' || issue.severity === 'CRITICAL') {
                issueBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              } else if (issue.severity === 'MEDIUM') {
                issueBadge = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
              }

              return (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${issueBadge}`}>
                        {issue.severity} RISK
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {issue.category}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {issue.description}
                  </p>

                  {issue.recommendation && (
                    <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                      <span className="font-semibold text-indigo-400 shrink-0">Recommendation:</span>
                      <span>{issue.recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2-Column Core Entity Grid: Customer & Supplier Information (TASK 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Information Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Customer Information</h3>
              <p className="text-[11px] text-slate-400">Consignee & Delivery Destination</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Contact Person</span>
              <p className="text-sm font-semibold text-white mt-0.5">{currentOrder.customer?.name}</p>
            </div>

            <div>
              <span className="text-slate-400">Company Name</span>
              <p className="text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {currentOrder.customer?.company}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400">Email Address</span>
                <p className="text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {currentOrder.customer?.email}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Contact Phone</span>
                <p className="text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {currentOrder.customer?.phone}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Shipping Delivery Address</span>
              <p className="text-slate-200 mt-1 leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  {currentOrder.customer?.shippingAddress?.street}, {currentOrder.customer?.shippingAddress?.city}, {currentOrder.customer?.shippingAddress?.state} - {currentOrder.customer?.shippingAddress?.postalCode}, {currentOrder.customer?.shippingAddress?.country}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Information Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supplier Information</h3>
              <p className="text-[11px] text-slate-400">Manufacturer & Origin Warehouse</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Supplier Name</span>
              <p className="text-sm font-semibold text-white mt-0.5">{currentOrder.supplier?.name}</p>
            </div>

            <div>
              <span className="text-slate-400">Dispatch Contact Person</span>
              <p className="text-slate-200 font-medium mt-0.5">{currentOrder.supplier?.contactPerson}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400">Supplier Email</span>
                <p className="text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {currentOrder.supplier?.email}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Supplier Phone</span>
                <p className="text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {currentOrder.supplier?.phone}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Origin Fulfillment Warehouse</span>
              <p className="text-slate-200 mt-1 leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{currentOrder.supplier?.warehouse}</span>
              </p>
              <div className="mt-2 text-[11px] text-slate-400 font-mono">
                Supplier Internal SKU: <span className="text-cyan-300">{currentOrder.supplier?.supplierSku}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Shipment Information Card (Extracted TinyFish Core Payload) (TASK 3) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Shipment Information & Carrier Telemetry
                </h3>
                {isLive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    LIVE TINYFISH EXTRACTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isLive 
                  ? `Automated web agent execution on ${shipment.carrierTrackingUrl || 'carrier portal'}` 
                  : 'Structured schema conforming to TinyFish Playground extraction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncLive}
              disabled={isLiveSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              {isLiveSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isLiveSyncing ? 'Fetching...' : 'Re-Run TinyFish Agent'}</span>
            </button>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Carrier: {shipment.carrier || 'Not assigned'}
            </span>
          </div>
        </div>

        {/* Structured 6-Field Grid matching TinyFish Output */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Waybill */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Waybill Number</span>
            <div className="flex items-center justify-between mt-1.5">
              <span className="font-mono font-bold text-white text-sm">
                {shipment.waybillNumber || 'UNASSIGNED'}
              </span>
              {shipment.waybillNumber && (
                <button
                  onClick={handleCopyWaybill}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy Waybill"
                >
                  {copiedWaybill ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Shipment Status */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Shipment Status</span>
            <p className="font-bold text-white text-sm mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {shipment.shipmentStatus || 'Status Unavailable'}
            </p>
          </div>

          {/* Current Location */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Current Location</span>
            <p className="font-semibold text-slate-200 text-sm mt-1.5 truncate">
              {shipment.currentLocation || 'Unknown Hub'}
            </p>
          </div>

          {/* Origin & Destination */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Origin & Destination</span>
            <div className="text-xs mt-1.5 space-y-1">
              <div className="text-slate-300">
                <span className="text-slate-500">From:</span> {shipment.origin?.city || 'N/A'}, {shipment.origin?.country || ''}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">To:</span> {shipment.destination?.city || 'N/A'}, {shipment.destination?.country || ''}
              </div>
            </div>
          </div>

          {/* Latest Tracking Update */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Latest Tracking Update</span>
            <p className="font-semibold text-slate-200 text-xs mt-1.5 font-mono">
              {shipment.latestTrackingUpdate 
                ? (shipment.latestTrackingUpdate.includes('T') ? new Date(shipment.latestTrackingUpdate).toLocaleString() : shipment.latestTrackingUpdate)
                : 'No update recorded'}
            </p>
          </div>

          {/* Expected Delivery Date */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">Expected Delivery Date (ETA)</span>
            <p className={`font-bold text-sm mt-1.5 ${
              !shipment.expectedDeliveryDate 
                ? 'text-amber-400 font-mono text-xs' 
                : 'text-white'
            }`}>
              {shipment.expectedDeliveryDate 
                ? new Date(shipment.expectedDeliveryDate).toLocaleDateString() 
                : 'Not Provided / Completed'}
            </p>
          </div>

        </div>

        {/* Live Execution Run Metadata (When Live Sync has run) */}
        {shipment.liveRunMeta && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">TinyFish Cloud Agent Execution Meta:</span>
              <span className="font-mono text-cyan-300 text-[11px]">Run #{shipment.liveRunMeta.runId?.slice(0, 12)}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>Steps: <strong className="text-white">{shipment.liveRunMeta.stepsCount || 13}</strong></span>
              <span>Duration: <strong className="text-white">{shipment.liveRunMeta.durationSeconds}s</strong></span>
              <span>Portal: <span className="text-slate-300">{shipment.carrierTrackingUrl}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Tracking History (Milestones Timeline) (TASK 3) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tracking History</h3>
              <p className="text-xs text-slate-400">
                Audit trail of checkpoints and carrier scans ({history.length} events logged)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No tracking events recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {history.map((event, idx) => {
                const isLatest = idx === history.length - 1;
                const isDelivered = (event.status || '').toLowerCase().includes('deliver');
                const isException = (event.status || '').toLowerCase().includes('exception') || 
                                    (event.description || '').toLowerCase().includes('breakdown') || 
                                    (event.description || '').toLowerCase().includes('hold') || 
                                    (event.description || '').toLowerCase().includes('delay');

                return (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isException
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : isDelivered
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                          : isLatest
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isException ? 'bg-rose-500' : isDelivered ? 'bg-emerald-400' : isLatest ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'
                      }`} />
                    </div>

                    {/* Event Content */}
                    <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className={`text-sm font-bold ${
                          isException ? 'text-rose-300' : isDelivered ? 'text-emerald-300' : 'text-white'
                        }`}>
                          {event.status}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {event.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.location}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-sm font-bold text-white mb-3">Order Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(currentOrder.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{item.name}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{item.sku}</td>
                  <td className="py-2.5 px-3 text-slate-300 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-slate-200 text-right font-medium">{item.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
