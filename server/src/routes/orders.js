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
 * POST /api/orders/reset
 * Resets in-memory orders back to demoOrders base data
 */
router.post('/reset', (req, res) => {
  orders = JSON.parse(JSON.stringify(demoOrders));
  res.json({
    success: true,
    message: 'Reset in-memory orders to initial demo dataset.'
  });
});

/**
 * POST /api/orders/tinyfish/track
 * Runs live TinyFish Web Agent to extract live tracking from a carrier tracking portal.
 * Validates carrier and tracking portal URL. Never mutates order on failed or incomplete runs.
 */
router.post('/tinyfish/track', async (req, res) => {
  try {
    const { 
      waybillNumber, 
      trackingUrl, 
      carrier,
      orderId 
    } = req.body || {};

    if (!isTinyFishConfigured()) {
      return res.status(400).json({
        success: false,
        extractionStatus: 'CONNECTION_ERROR',
        error: 'TINYFISH_API_KEY is not configured in server/.env. Please configure your key.'
      });
    }

    // 1. Target Order & Carrier URL Validation
    if (!orderId && !waybillNumber) {
      return res.status(400).json({
        success: false,
        extractionStatus: 'VALIDATION_ERROR',
        error: 'orderId or waybillNumber is required to initiate live tracking.'
      });
    }

    let targetOrder = null;
    if (orderId) {
      targetOrder = orders.find(o => o.id === orderId || o.customerOrderId === orderId);
    } else if (waybillNumber) {
      targetOrder = orders.find(o => o.shipment?.waybillNumber === waybillNumber);
    }

    if (!targetOrder) {
      return res.status(404).json({
        success: false,
        extractionStatus: 'VALIDATION_ERROR',
        error: `Order '${orderId || waybillNumber}' was not found in Orderix database.`
      });
    }

    const orderCarrier = targetOrder.shipment?.carrier || carrier || 'Unknown Carrier';
    // Do NOT default an unknown or missing carrier tracking URL to Parcel Perfect
    const orderTrackingUrl = targetOrder.shipment?.carrierTrackingUrl || trackingUrl || null;
    const orderWaybill = waybillNumber || targetOrder.shipment?.waybillNumber;

    // Check that the selected order has a configured tracking URL
    if (!orderTrackingUrl || typeof orderTrackingUrl !== 'string' || orderTrackingUrl.trim() === '') {
      return res.status(400).json({
        success: false,
        extractionStatus: 'UNSUPPORTED_CARRIER',
        error: `Tracking portal URL is not configured for ${orderCarrier}. Live TinyFish extraction requires an active carrier tracking portal URL.`
      });
    }

    // Carrier mismatch validation: Do not allow BlueDart orders to use Parcel Perfect sandbox URL
    const isBlueDart = orderCarrier.toLowerCase().includes('bluedart');
    const isParcelPerfectUrl = orderTrackingUrl.toLowerCase().includes('parcelperfect.com');
    if (isBlueDart && isParcelPerfectUrl) {
      return res.status(400).json({
        success: false,
        extractionStatus: 'UNSUPPORTED_CARRIER',
        error: `Carrier configuration error: Order carrier is '${orderCarrier}', but the tracking URL is for Parcel Perfect. Cross-carrier sandbox tracking is not permitted.`
      });
    }

    // 2. Call live TinyFish Web Agent
    const extractionResult = await trackShipmentWithTinyFish({
      waybillNumber: orderWaybill,
      trackingUrl: orderTrackingUrl,
      carrier: orderCarrier
    });

    // 3. Handle unsuccessful extraction: Preserve order & existing shipment data
    if (!extractionResult.success) {
      const intelligence = analyzeShipmentIntelligence(targetOrder);

      return res.status(200).json({
        success: false,
        extractionStatus: extractionResult.extractionStatus, // 'WAYBILL_NOT_FOUND' | 'EXTRACTION_INCOMPLETE' | 'CONNECTION_ERROR'
        message: extractionResult.message || 'Tracking extraction was unsuccessful.',
        rawResponse: extractionResult.rawResponse,
        liveRunMeta: extractionResult.liveRunMeta,
        data: {
          order: {
            ...targetOrder,
            intelligence
          },
          preservedShipment: targetOrder.shipment,
          extractionStatus: extractionResult.extractionStatus,
          rawResponse: extractionResult.rawResponse,
          message: extractionResult.message
        }
      });
    }

    // 4. Successful extraction: Update shipment information ONLY after successful validation
    const liveShipment = extractionResult.shipment;

    targetOrder.shipment = {
      ...targetOrder.shipment,
      ...liveShipment
    };

    // Update orderStatus ONLY if valid genuine status was extracted
    if (liveShipment.shipmentStatus) {
      const st = liveShipment.shipmentStatus.toLowerCase();
      if (st.includes('deliver') && !st.includes('undelivered') && !st.includes('pending delivery')) {
        targetOrder.orderStatus = 'Delivered';
      } else if (st.includes('transit') || st.includes('customs') || st.includes('collect') || st.includes('dispatched')) {
        targetOrder.orderStatus = 'Dispatched';
      }
    }

    // Enrich with updated AI shipment intelligence
    const intelligence = analyzeShipmentIntelligence(targetOrder);
    targetOrder.intelligence = intelligence;

    return res.json({
      success: true,
      extractionStatus: 'LIVE_EXTRACTION_SUCCESSFUL',
      message: `Successfully extracted live tracking telemetry for Waybill #${orderWaybill}.`,
      rawResponse: extractionResult.rawResponse,
      data: {
        order: targetOrder,
        shipment: liveShipment,
        intelligence,
        extractionStatus: 'LIVE_EXTRACTION_SUCCESSFUL'
      }
    });

  } catch (err) {
    console.error('[TinyFish Route Error]:', err.message);
    res.status(500).json({
      success: false,
      extractionStatus: 'CONNECTION_ERROR',
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
