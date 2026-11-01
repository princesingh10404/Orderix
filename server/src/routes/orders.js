import { Router } from 'express';
import { demoOrders } from '../data/demoOrders.js';
import { analyzeShipmentIntelligence } from '../intelligence.js';
import { trackShipmentWithTinyFish, isTinyFishConfigured } from '../tinyfish.js';

const router = Router();

// In-memory order store initialized with demo data
let orders = JSON.parse(JSON.stringify(demoOrders));

/**
 * GET /api/orders/tinyfish/status
 * Confirms whether TinyFish API key is available without exposing it
 */
router.get('/tinyfish/status', (req, res) => {
  const configured = isTinyFishConfigured();
  res.json({
    success: true,
    data: {
      configured,
      status: configured ? 'ACTIVE_AND_READY' : 'KEY_MISSING',
      message: configured
        ? 'TinyFish live API is authenticated and ready for web agent extraction.'
        : 'TINYFISH_API_KEY is not configured in server/.env.',
      targetSandbox: 'https://parcelperfect.com/tracking-demo/ (Waybill 1)'
    }
  });
});

/**
 * POST /api/orders/tinyfish/track
 * Runs live TinyFish Web Agent to extract live tracking from Parcel Perfect or any public tracking portal
 */
router.post('/tinyfish/track', async (req, res) => {
  try {
    const { 
      waybillNumber = '1', 
      trackingUrl = 'https://parcelperfect.com/tracking-demo/', 
      carrier = 'Parcel Perfect Express',
      orderId = 'ord-100'
    } = req.body || {};

    if (!isTinyFishConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'TINYFISH_API_KEY is not configured in server/.env. Please configure your key.'
      });
    }

    // Call official TinyFish API
    const liveShipment = await trackShipmentWithTinyFish({
      waybillNumber,
      trackingUrl,
      carrier
    });

    // Update in-memory order if orderId matches
    let targetOrder = orders.find(o => o.id === orderId || o.customerOrderId === orderId || o.shipment?.waybillNumber === waybillNumber);

    if (targetOrder) {
      targetOrder.shipment = {
        ...targetOrder.shipment,
        ...liveShipment
      };
      if (liveShipment.shipmentStatus) {
        targetOrder.orderStatus = liveShipment.shipmentStatus.toLowerCase().includes('deliver') ? 'Delivered' : 'Dispatched';
      }
    } else {
      // If no matching order found, create a live tracked order entry
      targetOrder = {
        id: `ord-live-${Date.now()}`,
        customerOrderId: `ORD-LIVE-${waybillNumber}`,
        supplierOrderId: `SUP-LIVE-${waybillNumber}`,
        orderDate: new Date().toISOString(),
        orderStatus: liveShipment.shipmentStatus.toLowerCase().includes('deliver') ? 'Delivered' : 'Dispatched',
        totalAmount: '$1,950.00',
        priority: 'High',
        items: [{ name: 'Tracked Consignment Item', sku: 'LIVE-ITEM-1', quantity: 1, unitPrice: '$1,950.00' }],
        customer: {
          name: 'PPOnline Testing Consignee',
          company: 'Parcel Perfect Logistics Client',
          email: 'tracking@parcelperfect.com',
          phone: '+27 21 555 0100',
          shippingAddress: {
            street: 'Cape Town Central Delivery Station',
            city: liveShipment.destination?.city || 'Cape Town',
            state: 'Western Cape',
            postalCode: '8001',
            country: 'South Africa'
          }
        },
        supplier: {
          name: 'Parcel Perfect Sandbox Fulfillment',
          contactPerson: 'Sandboxed Supplier',
          email: 'support@parcelperfect.com',
          phone: '+27 11 000 1122',
          warehouse: 'CPT Sort Hub',
          supplierSku: 'PP-SANDBOX-SKU'
        },
        shipment: liveShipment
      };
      orders.unshift(targetOrder);
    }

    // Enrich with updated AI shipment intelligence
    const intelligence = analyzeShipmentIntelligence(targetOrder);
    const enrichedOrder = {
      ...targetOrder,
      intelligence
    };

    res.json({
      success: true,
      data: {
        order: enrichedOrder,
        liveShipment,
        message: `Successfully executed live TinyFish agent run on ${trackingUrl} for Waybill #${waybillNumber}.`
      }
    });

  } catch (err) {
    console.error('[TinyFish Route Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/orders
 * Returns list of orders enriched with AI intelligence analysis and dashboard metric aggregates
 */
router.get('/', (req, res) => {
  const { status, search, riskLevel, filterType } = req.query;

  // Enrich each order with real-time AI shipment intelligence
  const enrichedOrders = orders.map(order => {
    const intelligence = analyzeShipmentIntelligence(order);
    return {
      ...order,
      intelligence
    };
  });

  // Calculate high-level KPI dashboard metrics across all orders
  const metrics = {
    totalOrders: enrichedOrders.length,
    processingOrders: enrichedOrders.filter(o => o.orderStatus.toLowerCase() === 'processing').length,
    dispatchedOrders: enrichedOrders.filter(o => o.orderStatus.toLowerCase() === 'dispatched').length,
    potentiallyDelayedOrders: enrichedOrders.filter(o => o.intelligence.isPotentiallyDelayed).length,
    // Detailed intelligence breakdown
    staleTrackingCount: enrichedOrders.filter(o => o.intelligence.hasStaleUpdates).length,
    conflictingStatusCount: enrichedOrders.filter(o => o.intelligence.hasConflictingStatus).length,
    missingInfoCount: enrichedOrders.filter(o => o.intelligence.hasMissingInfo).length,
    criticalRiskCount: enrichedOrders.filter(o => o.intelligence.riskLevel === 'CRITICAL').length
  };

  // Filter orders based on query parameters
  let filtered = [...enrichedOrders];

  if (status && status !== 'all') {
    filtered = filtered.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
  }

  if (riskLevel && riskLevel !== 'all') {
    filtered = filtered.filter(o => o.intelligence.riskLevel.toLowerCase() === riskLevel.toLowerCase());
  }

  if (filterType === 'delayed') {
    filtered = filtered.filter(o => o.intelligence.isPotentiallyDelayed);
  } else if (filterType === 'stale') {
    filtered = filtered.filter(o => o.intelligence.hasStaleUpdates);
  } else if (filterType === 'conflicting') {
    filtered = filtered.filter(o => o.intelligence.hasConflictingStatus);
  } else if (filterType === 'missing') {
    filtered = filtered.filter(o => o.intelligence.hasMissingInfo);
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(o => 
      o.customerOrderId.toLowerCase().includes(q) ||
      o.supplierOrderId.toLowerCase().includes(q) ||
      (o.shipment?.waybillNumber && o.shipment.waybillNumber.toLowerCase().includes(q)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
      (o.customer?.company && o.customer.company.toLowerCase().includes(q)) ||
      (o.supplier?.name && o.supplier.name.toLowerCase().includes(q)) ||
      (o.shipment?.carrier && o.shipment.carrier.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    data: {
      metrics,
      orders: filtered,
      dataSourceNotice: {
        isDemoData: true,
        source: "Extracted via TinyFish Playground - Demo Dataset (Live TinyFish Engine Connected)",
        notice: "Live TinyFish webhook integration available. Click 'Sync Live TinyFish' to trigger live extraction."
      }
    }
  });
});

/**
 * GET /api/orders/:id
 * Returns a single order with comprehensive details and intelligence report
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id || o.customerOrderId === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Order with ID ${id} not found.`
    });
  }

  const intelligence = analyzeShipmentIntelligence(order);

  res.json({
    success: true,
    data: {
      order: {
        ...order,
        intelligence
      },
      dataSourceNotice: {
        isDemoData: order.shipment?.isDemoData ?? true,
        source: order.shipment?.dataSource || "TinyFish Extracted Payload",
        notice: order.shipment?.isDemoData 
          ? "Simulated public tracking extraction. Click 'Fetch Live with TinyFish' to verify live web extraction." 
          : "Verified live tracking data extracted by TinyFish cloud agent."
      }
    }
  });
});

/**
 * POST /api/intelligence/analyze
 * Allows on-the-fly intelligence analysis of any extracted tracking JSON payload
 */
router.post('/intelligence/analyze', (req, res) => {
  try {
    const rawPayload = req.body;
    if (!rawPayload) {
      return res.status(400).json({ success: false, error: "Empty payload received." });
    }

    // Structure into order wrapper if only shipment was sent
    const orderToAnalyze = rawPayload.shipment ? rawPayload : {
      id: rawPayload.id || 'custom-test-payload',
      customerOrderId: rawPayload.customerOrderId || 'ORD-CUSTOM-TEST',
      supplierOrderId: rawPayload.supplierOrderId || 'SUP-CUSTOM-TEST',
      orderStatus: rawPayload.orderStatus || 'Dispatched',
      orderDate: rawPayload.orderDate || new Date().toISOString(),
      customer: rawPayload.customer || { name: 'Sample Customer', company: 'Sample Enterprise' },
      supplier: rawPayload.supplier || { name: 'Sample Supplier' },
      shipment: rawPayload
    };

    const analysis = analyzeShipmentIntelligence(orderToAnalyze);

    res.json({
      success: true,
      data: {
        analysis,
        isDemoData: rawPayload.isDemoData ?? true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
