import React from 'react';
import { 
  ArrowRight, 
  Truck, 
  MapPin, 
  Clock, 
  Search
} from 'lucide-react';

export default function OrderList({ orders = [], onSelectOrder }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No matching orders found</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Try clearing your search query or switching your active filter tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Order Management Stream
          </h3>
          <p className="text-xs text-slate-400">
            Showing {orders.length} orders analyzed with TinyFish extracted tracking data
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort: Latest Activity</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Order Identifiers</th>
              <th className="py-3.5 px-4">Customer & Destination</th>
              <th className="py-3.5 px-4">Supplier & Origin</th>
              <th className="py-3.5 px-4">Fulfillment Status</th>
              <th className="py-3.5 px-4">Carrier & Waybill</th>
              <th className="py-3.5 px-4">AI Shipment Intelligence</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {orders.map((order) => {
              const intel = order.intelligence || {};
              const shipment = order.shipment || {};
              const issues = intel.issues || [];

              // Risk level styles
              let riskBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              if (intel.riskLevel === 'CRITICAL') {
                riskBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
              } else if (intel.riskLevel === 'HIGH') {
                riskBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (intel.riskLevel === 'MEDIUM') {
                riskBadgeClass = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
              }

              // Order status styles
              const isDispatched = order.orderStatus.toLowerCase() === 'dispatched';
              const isProcessing = order.orderStatus.toLowerCase() === 'processing';

              return (
                <tr 
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Order IDs */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {order.customerOrderId}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {order.supplierOrderId}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-medium text-slate-200 truncate">
                        {order.customer?.name}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {order.customer?.company}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {order.customer?.shippingAddress?.city}, {order.customer?.shippingAddress?.state}
                      </span>
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col max-w-[190px]">
                      <span className="font-medium text-slate-300 text-xs truncate">
                        {order.supplier?.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate mt-0.5">
                        {order.supplier?.warehouse}
                      </span>
                    </div>
                  </td>

                  {/* Fulfillment Status */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        isDispatched 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : isProcessing 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                            : 'bg-slate-700/30 text-slate-300 border-slate-700'
                      }`}>
                        {isDispatched ? <Truck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.orderStatus}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {order.priority} Priority • {order.totalAmount}
                      </span>
                    </div>
                  </td>

                  {/* Carrier & Waybill */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col max-w-[190px]">
                      <span className="font-semibold text-slate-200 text-xs">
                        {shipment.carrier || 'Pending Carrier'}
                      </span>
                      <span className="font-mono text-xs text-indigo-400 truncate mt-0.5">
                        {shipment.waybillNumber || 'Unassigned'}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate mt-1">
                        Loc: {shipment.currentLocation || 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* AI Shipment Intelligence */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1.5 min-w-[210px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${riskBadgeClass}`}>
                          {intel.riskLevel} RISK ({intel.riskScore}/100)
                        </span>
                      </div>

                      {/* Detected Risk Pills */}
                      <div className="flex flex-wrap gap-1">
                        {intel.hasStaleUpdates && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            Stale Scan
                          </span>
                        )}
                        {intel.isPotentiallyDelayed && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                            Delayed ETA
                          </span>
                        )}
                        {intel.hasConflictingStatus && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                            Status Conflict
                          </span>
                        )}
                        {intel.hasMissingInfo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            Missing Info
                          </span>
                        )}
                        {issues.length === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            ✓ Optimal Health
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {intel.summary}
                      </p>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

