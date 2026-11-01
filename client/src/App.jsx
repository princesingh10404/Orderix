import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoDisclaimerBanner from './components/DemoDisclaimerBanner';
import MetricCards from './components/MetricCards';
import IntelligenceOverview from './components/IntelligenceOverview';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import RawJsonModal from './components/RawJsonModal';
import { fetchOrders, fetchOrderById } from './services/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    processingOrders: 0,
    dispatchedOrders: 0,
    potentiallyDelayedOrders: 0,
    staleTrackingCount: 0,
    conflictingStatusCount: 0,
    missingInfoCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order for Detail View
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Raw JSON Inspection Modal
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalOrder, setJsonModalOrder] = useState(null);

  // Load orders data from Express Backend
  const loadOrders = async (filter = activeFilter, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search) params.search = search;
      if (filter === 'processing') params.status = 'processing';
      else if (filter === 'dispatched') params.status = 'dispatched';
      else if (filter === 'delayed') params.filterType = 'delayed';
      else if (filter === 'stale') params.filterType = 'stale';
      else if (filter === 'conflicting') params.filterType = 'conflicting';
      else if (filter === 'missing') params.filterType = 'missing';

      const res = await fetchOrders(params);
      if (res.success) {
        setOrders(res.data.orders);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(activeFilter, searchTerm);
  }, [activeFilter, searchTerm]);

  // Handle Order Selection for Detail Page
  const handleSelectOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    try {
      setLoadingDetail(true);
      const res = await fetchOrderById(orderId);
      if (res.success) {
        setSelectedOrderData(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      // Fallback to local array
      const local = orders.find(o => o.id === orderId);
      if (local) setSelectedOrderData(local);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
    setSelectedOrderData(null);
  };

  const handleOpenJsonModal = (order = null) => {
    setJsonModalOrder(order || selectedOrderData || orders[0] || null);
    setIsJsonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => loadOrders(activeFilter, searchTerm)}
        activeView={selectedOrderId ? 'detail' : 'dashboard'}
        onNavigateDashboard={handleBackToDashboard}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hackathon Demo Notice Banner */}
        <DemoDisclaimerBanner onOpenPayloadModal={() => handleOpenJsonModal(null)} />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-sm">Backend Connectivity Error</p>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
        )}

        {selectedOrderId ? (
          /* Order Details View (Task 3) */
          loadingDetail ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading order intelligence payload...</p>
            </div>
          ) : (
            <OrderDetail
              order={selectedOrderData}
              onBack={handleBackToDashboard}
              onOpenJsonModal={handleOpenJsonModal}
              onOrderUpdated={(updated) => {
                setSelectedOrderData(updated);
                loadOrders(activeFilter, searchTerm);
              }}
            />
          )
        ) : (
          /* Dashboard View (Task 2 & Task 4 Overview) */
          <div>
            {/* KPI Metric Cards */}
            <MetricCards
              metrics={metrics}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* AI Shipment Intelligence Overview Banner */}
            <IntelligenceOverview
              metrics={metrics}
              onFilterSelect={setActiveFilter}
            />

            {/* Orders Stream / Table */}
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Analyzing tracking JSON and synchronizing orders...</p>
              </div>
            ) : (
              <OrderList
                orders={orders}
                onSelectOrder={handleSelectOrder}
                onOpenPayloadModal={handleOpenJsonModal}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Orderix Hackathon MVP &bull; AI-Powered Order & Shipment Intelligence</span>
          <span className="text-slate-400">
            Powered by TinyFish Structured Tracking Extraction • Node.js Express &bull; React + Tailwind
          </span>
        </div>
      </footer>

      {/* Raw JSON Inspection & Tester Modal */}
      <RawJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        selectedOrder={jsonModalOrder}
      />
    </div>
  );
}
