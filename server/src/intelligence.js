/**
 * OrderOS AI Shipment Intelligence Module
 * Analyzes extracted tracking JSON from TinyFish and identifies:
 * 1. Stale tracking updates
 * 2. Potentially delayed shipments
 * 3. Conflicting status information
 * 4. Missing delivery information
 */

// Delay-related keywords found in carrier scan logs
const DELAY_KEYWORDS = [
  'delay',
  'delayed',
  'exception',
  'congestion',
  'weather',
  'breakdown',
  'customs hold',
  'failed delivery',
  'misrouted',
  'backlog',
  'held',
  'operational bottleneck',
  'uncontrollable event'
];

/**
 * Analyzes an order and its extracted TinyFish tracking payload
 * @param {Object} order - Full order object including shipment tracking JSON
 * @param {Date} [referenceDate] - Optional anchor date (defaults to current time or latest data timestamp)
 * @returns {Object} Intelligence Report
 */
export function analyzeShipmentIntelligence(order, referenceDate = null) {
  const shipment = order.shipment || {};
  const history = shipment.shipmentHistory || [];
  
  // Use provided reference date, or November 1, 2026 (simulation time) / current time
  const now = referenceDate ? new Date(referenceDate) : new Date('2026-11-01T12:00:00Z');
  
  const issues = [];
  let riskScore = 10; // Baseline healthy score
  
  // --- 1. STALE TRACKING UPDATES ANALYSIS ---
  let staleAnalysis = {
    isStale: false,
    hoursSinceLastUpdate: null,
    severity: 'NONE',
    message: null
  };

  if (shipment.latestTrackingUpdate && shipment.shipmentStatus !== 'Delivered' && shipment.shipmentStatus !== 'Cancelled') {
    const lastUpdateDate = new Date(shipment.latestTrackingUpdate);
    const diffMs = now.getTime() - lastUpdateDate.getTime();
    const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
    staleAnalysis.hoursSinceLastUpdate = diffHours;

    if (diffHours >= 60) {
      staleAnalysis.isStale = true;
      staleAnalysis.severity = 'HIGH';
      staleAnalysis.message = `Critical scan blackout: Last carrier update was ${diffHours} hours ago (${lastUpdateDate.toLocaleDateString()}). Transit silence exceeds 60-hour threshold.`;
      issues.push({
        type: 'STALE_UPDATE',
        severity: 'HIGH',
        category: 'Stale Tracking Updates',
        title: 'Prolonged Tracking Stagnation (>60h)',
        description: staleAnalysis.message,
        recommendation: 'Contact carrier hub supervisor immediately to initiate physical dock search.'
      });
      riskScore += 35;
    } else if (diffHours >= 36) {
      staleAnalysis.isStale = true;
      staleAnalysis.severity = 'MEDIUM';
      staleAnalysis.message = `Potential stall detected: No carrier scan update in ${diffHours} hours. Standard update cadence is every 12-24h.`;
      issues.push({
        type: 'STALE_UPDATE',
        severity: 'MEDIUM',
        category: 'Stale Tracking Updates',
        title: 'Carrier Update Stale (>36h)',
        description: staleAnalysis.message,
        recommendation: 'Monitor next scheduled hub scan or ping carrier API for uncommitted checkpoints.'
      });
      riskScore += 20;
    }
  }

  // Check milestone timestamp consistency
  if (history.length > 0 && shipment.latestTrackingUpdate) {
    const latestMilestone = history[history.length - 1];
    const milestoneDate = new Date(latestMilestone.timestamp);
    const headerUpdateDate = new Date(shipment.latestTrackingUpdate);
    
    // Difference between latest milestone and header update timestamp > 24 hours
    const milestoneDeltaHours = Math.abs(headerUpdateDate.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60);
    if (milestoneDeltaHours > 24) {
      issues.push({
        type: 'STALE_UPDATE',
        severity: 'MEDIUM',
        category: 'Stale Tracking Updates',
        title: 'Checkpoint Desynchronization',
        description: `Header update timestamp (${shipment.latestTrackingUpdate.slice(0, 16)}) diverges from latest audit log event (${latestMilestone.timestamp.slice(0, 16)}) by ${Math.round(milestoneDeltaHours)} hours.`,
        recommendation: 'Re-sync tracking history checkpoints to resolve intermediate routing lag.'
      });
      riskScore += 15;
    }
  }

  // --- 2. POTENTIALLY DELAYED SHIPMENTS ANALYSIS ---
  let delayAnalysis = {
    isDelayed: false,
    severity: 'NONE',
    daysOverdue: 0,
    cause: null
  };

  if (shipment.expectedDeliveryDate && shipment.shipmentStatus !== 'Delivered') {
    const etaDate = new Date(shipment.expectedDeliveryDate);
    const isPastEta = now.getTime() > etaDate.getTime();
    
    if (isPastEta) {
      const daysOverdue = Math.ceil((now.getTime() - etaDate.getTime()) / (1000 * 60 * 60 * 24));
      delayAnalysis.isDelayed = true;
      delayAnalysis.daysOverdue = daysOverdue;
      delayAnalysis.severity = daysOverdue >= 2 ? 'HIGH' : 'MEDIUM';
      
      issues.push({
        type: 'POTENTIALLY_DELAYED',
        severity: delayAnalysis.severity,
        category: 'Potentially Delayed Shipments',
        title: `Shipment Overdue by ${daysOverdue} Day${daysOverdue > 1 ? 's' : ''}`,
        description: `Expected delivery date was ${etaDate.toLocaleDateString()}, but shipment remains in status "${shipment.shipmentStatus}" at "${shipment.currentLocation}".`,
        recommendation: `Notify customer ${order.customer?.name || 'purchaser'} of revised ETA and initiate carrier SLA escalation.`
      });
      riskScore += daysOverdue >= 2 ? 40 : 25;
    } else {
      // Check if ETA is imminent (< 24h) but current location is still far from destination
      const hoursToEta = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isDestinationCityInLocation = shipment.destination?.city && 
        shipment.currentLocation?.toLowerCase().includes(shipment.destination.city.toLowerCase());

      if (hoursToEta <= 24 && hoursToEta > 0 && !isDestinationCityInLocation && shipment.shipmentStatus !== 'Out for Delivery') {
        delayAnalysis.isDelayed = true;
        delayAnalysis.severity = 'MEDIUM';
        issues.push({
          type: 'POTENTIALLY_DELAYED',
          severity: 'MEDIUM',
          category: 'Potentially Delayed Shipments',
          title: 'High Velocity Delay Risk (<24h to ETA)',
          description: `Delivery expected within ${Math.round(hoursToEta)} hours, but current location "${shipment.currentLocation}" is not yet at destination hub (${shipment.destination?.city || 'destination'}).`,
          recommendation: 'Verify last-mile handoff readiness with regional hub logistics coordinator.'
        });
        riskScore += 20;
      }
    }
  }

  // Scan milestone descriptions for explicit delay/exception events
  const detectedExceptionEvents = history.filter(event => {
    const text = `${event.description || ''} ${event.status || ''}`.toLowerCase();
    return DELAY_KEYWORDS.some(kw => text.includes(kw));
  });

  if (detectedExceptionEvents.length > 0) {
    const lastEvent = detectedExceptionEvents[detectedExceptionEvents.length - 1];
    issues.push({
      type: 'POTENTIALLY_DELAYED',
      severity: 'HIGH',
      category: 'Potentially Delayed Shipments',
      title: 'Carrier Operational Exception Logged',
      description: `Carrier flagged exception at ${lastEvent.location}: "${lastEvent.description}"`,
      recommendation: 'Check carrier transit route bulletin or customs hold requirements.'
    });
    riskScore += 30;
  }

  // --- 3. CONFLICTING STATUS INFORMATION ANALYSIS ---
  const normalizedCarrierStatus = (shipment.shipmentStatus || '').toLowerCase();
  const normalizedOrderStatus = (order.orderStatus || '').toLowerCase();
  const latestHistoryEntry = history[history.length - 1] || {};
  const normalizedLatestEventStatus = (latestHistoryEntry.status || '').toLowerCase();

  // Conflict A: Carrier says Delivered, but order or location says otherwise
  if (normalizedCarrierStatus.includes('deliver') && !normalizedCarrierStatus.includes('out for')) {
    const destCity = shipment.destination?.city?.toLowerCase() || '';
    const currentLoc = (shipment.currentLocation || '').toLowerCase();
    const eventIsDelivered = normalizedLatestEventStatus.includes('deliver');

    if (!eventIsDelivered || (destCity && !currentLoc.includes(destCity) && !currentLoc.includes('delivered'))) {
      issues.push({
        type: 'CONFLICTING_STATUS',
        severity: 'CRITICAL',
        category: 'Conflicting Status Information',
        title: 'Premature Delivery Confirmation Discrepancy',
        description: `Shipment summary status is marked "${shipment.shipmentStatus}", but latest timeline event is "${latestHistoryEntry.status}" at "${latestHistoryEntry.location}". Package has not reached destination customer address.`,
        recommendation: 'Flag false delivery closure to carrier anti-fraud and loss prevention team.'
      });
      riskScore += 45;
    }
  }

  // Conflict B: Order status vs Carrier status mismatch
  if (normalizedOrderStatus === 'processing' && (normalizedCarrierStatus.includes('in transit') || normalizedCarrierStatus.includes('out for delivery') || normalizedCarrierStatus.includes('delivered'))) {
    issues.push({
      type: 'CONFLICTING_STATUS',
      severity: 'MEDIUM',
      category: 'Conflicting Status Information',
      title: 'Order Fulfillment vs Carrier State Desync',
      description: `Internal ERP status is "${order.orderStatus}" (unfulfilled), yet carrier tracking reports "${shipment.shipmentStatus}". Waybill may have been reused or scanned prior to ERP dispatch confirmation.`,
      recommendation: 'Synchronize warehouse WMS outbound status with carrier tracking.'
    });
    riskScore += 25;
  }

  if (normalizedOrderStatus === 'dispatched' && normalizedCarrierStatus.includes('manifest') && history.length <= 1) {
    // If dispatched over 48h ago but carrier still says just manifest created
    const orderCreated = order.orderDate ? new Date(order.orderDate) : null;
    if (orderCreated && (now.getTime() - orderCreated.getTime()) / (1000 * 60 * 60) > 48) {
      issues.push({
        type: 'CONFLICTING_STATUS',
        severity: 'MEDIUM',
        category: 'Conflicting Status Information',
        title: 'Supplier Dispatch Lag / Carrier Uncollected',
        description: `Order was marked Dispatched on ${orderCreated.toLocaleDateString()}, but carrier status remains "${shipment.shipmentStatus}" with no physical intake scan.`,
        recommendation: 'Confirm physical carrier handover with supplier warehouse dock.'
      });
      riskScore += 20;
    }
  }

  // --- 4. MISSING DELIVERY INFORMATION ANALYSIS ---
  const missingFields = [];

  if (!shipment.expectedDeliveryDate || shipment.expectedDeliveryDate === 'TBD' || shipment.expectedDeliveryDate === '') {
    missingFields.push('Expected Delivery Date (ETA)');
  }
  if (!shipment.waybillNumber || shipment.waybillNumber.includes('UNASSIGNED') || shipment.waybillNumber.includes('PENDING')) {
    missingFields.push('Carrier Waybill / Tracking Number');
  }
  if (!shipment.destination?.city || !shipment.destination?.country) {
    missingFields.push('Destination City/Country');
  }
  if (!shipment.origin?.city) {
    missingFields.push('Origin Facility / Origin City');
  }
  if (!history || history.length === 0) {
    missingFields.push('Shipment History Audit Trail');
  }

  if (missingFields.length > 0) {
    const isCritical = missingFields.includes('Expected Delivery Date (ETA)') && missingFields.includes('Carrier Waybill / Tracking Number');
    issues.push({
      type: 'MISSING_INFO',
      severity: isCritical ? 'HIGH' : 'MEDIUM',
      category: 'Missing Delivery Information',
      title: `Incomplete Tracking Telemetry (${missingFields.length} missing)`,
      description: `The extracted tracking payload is missing key operational data: ${missingFields.join(', ')}.`,
      recommendation: 'Enforce carrier payload completeness schema or query carrier webhook for missing manifests.'
    });
    riskScore += missingFields.length * 12;
  }

  // Cap risk score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine overall Risk Level
  let riskLevel = 'LOW';
  let badgeColor = 'emerald';
  if (riskScore >= 75) {
    riskLevel = 'CRITICAL';
    badgeColor = 'rose';
  } else if (riskScore >= 50) {
    riskLevel = 'HIGH';
    badgeColor = 'amber';
  } else if (riskScore >= 25) {
    riskLevel = 'MEDIUM';
    badgeColor = 'yellow';
  }

  // AI-generated summary synthesis
  let summary = '';
  if (issues.length === 0) {
    summary = 'Shipment is progressing normally within carrier SLA thresholds. Checkpoint updates and telemetry are current.';
  } else {
    const issueTitles = issues.map(i => i.title).join('; ');
    summary = `Identified ${issues.length} operational risk factor${issues.length > 1 ? 's' : ''}: ${issueTitles}. Immediate manager review recommended.`;
  }

  // Calculate categorized counts
  const categoryCounts = {
    staleUpdates: issues.filter(i => i.type === 'STALE_UPDATE').length,
    potentialDelays: issues.filter(i => i.type === 'POTENTIALLY_DELAYED').length,
    conflictingStatus: issues.filter(i => i.type === 'CONFLICTING_STATUS').length,
    missingInfo: issues.filter(i => i.type === 'MISSING_INFO').length
  };

  return {
    orderId: order.id,
    customerOrderId: order.customerOrderId,
    supplierOrderId: order.supplierOrderId,
    waybillNumber: shipment.waybillNumber || 'N/A',
    carrier: shipment.carrier || 'Unknown Carrier',
    analyzedAt: now.toISOString(),
    riskScore,
    riskLevel,
    badgeColor,
    isPotentiallyDelayed: categoryCounts.potentialDelays > 0 || riskScore >= 50,
    hasStaleUpdates: categoryCounts.staleUpdates > 0,
    hasConflictingStatus: categoryCounts.conflictingStatus > 0,
    hasMissingInfo: categoryCounts.missingInfo > 0,
    categoryCounts,
    summary,
    issues,
    rawPayloadSummary: {
      origin: shipment.origin ? `${shipment.origin.city}, ${shipment.origin.country}` : 'Unknown',
      destination: shipment.destination ? `${shipment.destination.city}, ${shipment.destination.country}` : 'Unknown',
      currentLocation: shipment.currentLocation || 'Unknown',
      latestTrackingUpdate: shipment.latestTrackingUpdate || 'None',
      expectedDeliveryDate: shipment.expectedDeliveryDate || 'Missing',
      shipmentStatus: shipment.shipmentStatus || 'Unknown',
      historyEventsCount: history.length,
      dataSource: shipment.dataSource || 'TinyFish Demo Payload'
    }
  };
}

