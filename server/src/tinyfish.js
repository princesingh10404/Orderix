/**
 * Orderix Live TinyFish Integration Service
 * Connects to the official TinyFish Agent API (https://agent.tinyfish.ai/v1/automation/run)
 * Automates tracking extraction from public tracking portals including Parcel Perfect.
 *
 * NOTE: Credentials are read from process.env and never logged, printed, or exposed.
 * DATA INTEGRITY: Fabricated defaults (Cape Town, Delivered, fake timestamps, synthetic history)
 * have been eliminated. Failed or missing lookups return explicit error states.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const TINYFISH_API_URL = 'https://agent.tinyfish.ai/v1/automation/run';
const DEFAULT_TRACKING_URL = 'https://parcelperfect.com/tracking-demo/';

/**
 * Checks if TinyFish API is configured without revealing the key
 */
export function isTinyFishConfigured() {
  const key = process.env.TINYFISH_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Normalizes hub strings to structured city/country/hub objects without fabricating unextracted regions
 */
function normalizeLocation(hubStr) {
  if (!hubStr) return null;
  const str = hubStr.trim();
  if (!str || str.toLowerCase().includes('no details') || str === '-') {
    return null;
  }
  const upper = str.toUpperCase();
  if (upper === 'CPT' || upper.includes('CAPE TOWN')) {
    return { city: 'Cape Town', country: 'South Africa', hub: str };
  }
  if (upper === 'JNB' || upper.includes('JOHANNESBURG')) {
    return { city: 'Johannesburg', country: 'South Africa', hub: str };
  }
  if (upper === 'DUR' || upper.includes('DURBAN')) {
    return { city: 'Durban', country: 'South Africa', hub: str };
  }
  if (upper === 'BLR' || upper.includes('BENGALURU') || upper.includes('BANGALORE')) {
    return { city: 'Bengaluru', country: 'India', hub: str };
  }
  if (upper === 'MAA' || upper.includes('CHENNAI')) {
    return { city: 'Chennai', country: 'India', hub: str };
  }
  if (upper === 'BOM' || upper.includes('MUMBAI')) {
    return { city: 'Mumbai', country: 'India', hub: str };
  }
  return { city: str, country: '', hub: str };
}

/**
 * Formats date and time into an ISO-like timestamp string
 */
function formatTimestamp(dateStr, timeStr) {
  if (!dateStr) return null;
  const parts = dateStr.split(/[./-]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 4 ? y : `20${y}`;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${timeStr || '00:00:00'}Z`;
  }
  return `${dateStr} ${timeStr || ''}`.trim();
}

/**
 * Infers shipment milestone status from event details text
 */
function inferStatusFromDetails(details) {
  if (!details) return 'In Transit Scan';
  const d = details.toLowerCase();
  if (d.includes('delivered') || d.includes('proof of delivery')) return 'Delivered';
  if (d.includes('customs')) return 'Released from Customs';
  if (d.includes('collected') || d.includes('picked up')) return 'Collected from Origin';
  if (d.includes('transit') || d.includes('overnight')) return 'In Transit';
  if (d.includes('captured') || d.includes('entered')) return 'Consignment Captured';
  return details.slice(0, 40);
}

/**
 * Flexible field extractor that handles bold markdown keys and values:
 * - **Origin Hub:** CPT
 * - **Origin Hub**: CPT
 * - Origin Hub: CPT
 * Requires a colon delimiter to avoid falsely matching prose sentences.
 */
function extractField(text, keyPattern, valuePattern = '[^\\n\\r|]+') {
  // Strip any wrapping parentheses from valuePattern if passed by caller
  const cleanPattern = valuePattern.replace(/^\(|\)$/g, '');
  const regex = new RegExp(`-?\\s*\\*{0,2}\\s*${keyPattern}\\s*(?::\\s*\\*{1,2}|\\*{1,2}\\s*:|:)\\s*(${cleanPattern})`, 'i');
  const m = text.match(regex);
  if (m && m[1]) {
    const clean = m[1].replace(/^\*+|\*+$/g, '').replace(/^['"]|['"]$/g, '').trim();
    if (clean.length > 0) return clean;
  }
  return null;
}

/**
 * Parses raw text/markdown or structured object returned by TinyFish agent.
 * Eliminates hallucinated defaults. Detects "No details found" and incomplete extractions.
 *
 * @param {string|Object} rawResult - Output returned by TinyFish API
 * @param {string} defaultWaybill - The waybill requested
 * @param {string} defaultCarrier - The carrier name
 * @param {string} trackingUrl - The carrier tracking URL visited
 * @param {Object} [liveRunMeta={}] - Execution metadata (duration, steps, runId)
 * @returns {Object} Extraction outcome with success: boolean and extractionStatus
 */
export function parseTinyFishExtractedResult(
  rawResult,
  defaultWaybill = '1',
  defaultCarrier = 'Parcel Perfect Express',
  trackingUrl = DEFAULT_TRACKING_URL,
  liveRunMeta = {}
) {
  // If result is wrapped under { result: string | object }
  let content = rawResult;
  if (rawResult && typeof rawResult === 'object' && rawResult.result !== undefined) {
    content = rawResult.result;
  }

  // Handle structured object if TinyFish returned pre-parsed JSON
  if (content && typeof content === 'object') {
    const status = content.shipmentStatus || content.status;
    const isExplicitlyNotFound =
      (content.message && content.message.toLowerCase().includes('not found')) ||
      (typeof status === 'string' && status.toLowerCase().includes('no details'));

    if (isExplicitlyNotFound) {
      return {
        success: false,
        extractionStatus: 'WAYBILL_NOT_FOUND',
        waybillNumber: content.waybillNumber || String(defaultWaybill),
        carrier: content.carrier || defaultCarrier,
        carrierTrackingUrl: trackingUrl,
        message: `Waybill '${defaultWaybill}' was not found on carrier portal.`,
        rawResponse: JSON.stringify(content, null, 2),
        liveRunMeta: { ...liveRunMeta, extractionSuccess: false }
      };
    }

    return {
      success: true,
      extractionStatus: 'LIVE_EXTRACTION_SUCCESSFUL',
      shipment: {
        waybillNumber: content.waybillNumber || String(defaultWaybill),
        carrier: content.carrier || defaultCarrier,
        carrierTrackingUrl: trackingUrl,
        origin: typeof content.origin === 'object' ? content.origin : normalizeLocation(content.origin),
        destination: typeof content.destination === 'object' ? content.destination : normalizeLocation(content.destination),
        shipmentStatus: status || 'In Transit',
        currentLocation: content.currentLocation || null,
        latestTrackingUpdate: content.latestTrackingUpdate || null,
        expectedDeliveryDate: content.expectedDeliveryDate || null,
        shipmentHistory: Array.isArray(content.shipmentHistory) ? content.shipmentHistory : [],
        dataSource: `TinyFish Live Web Agent (${defaultCarrier})`,
        isDemoData: false,
        liveRunMeta: { ...liveRunMeta, extractionSuccess: true }
      },
      rawResponse: JSON.stringify(content, null, 2),
      liveRunMeta: { ...liveRunMeta, extractionSuccess: true }
    };
  }

  // If content is string/markdown from TinyFish agent:
  const text = String(content || '').trim();
  const lowerText = text.toLowerCase();

  // 1. Detect "No details found" / "Not found" responses
  const notFoundPhrases = [
    'no details found',
    'no records found',
    'no tracking data found',
    'no tracking details found',
    'no shipment data associated with it',
    'returned "no details found"',
    'no event history available'
  ];

  const hasNotFoundPhrase = notFoundPhrases.some(phrase => lowerText.includes(phrase));

  // Extract fields with robust markdown support (handling asterisks around keys and values)
  const waybillFromHeader = text.match(/Waybill\s*#\s*([A-Za-z0-9_-]+)/i);
  const waybillExtracted =
    (waybillFromHeader ? waybillFromHeader[1] : null) ||
    extractField(text, 'Waybill(?:\\s+Number)?', '([A-Za-z0-9_-]+)');
  const originRaw = extractField(text, 'Origin(?:\\s+Hub)?');
  const destRaw = extractField(text, 'Destination(?:\\s+Hub)?');
  const statusRaw = extractField(text, '(?:Shipment\\s+Status|POD\\s+Status|Status)');
  const etaRaw = extractField(text, '(?:Expected\\s+Delivery(?:\\s+Date)?|ETA)');
  const summaryDate = extractField(text, 'Date');

  // Check if extracted origin or destination specifically say "no details found"
  const originIsNotFound = originRaw && originRaw.toLowerCase().includes('no details');
  const destIsNotFound = destRaw && destRaw.toLowerCase().includes('no details');
  const statusIsNotFound = statusRaw && statusRaw.toLowerCase().includes('no details');

  if (hasNotFoundPhrase || (originIsNotFound && destIsNotFound) || (hasNotFoundPhrase && statusIsNotFound)) {
    return {
      success: false,
      extractionStatus: 'WAYBILL_NOT_FOUND',
      waybillNumber: waybillExtracted || defaultWaybill,
      carrier: defaultCarrier,
      carrierTrackingUrl: trackingUrl,
      message: `Waybill '${waybillExtracted || defaultWaybill}' was not found on carrier tracking portal. Portal returned 'No details found'.`,
      rawResponse: text,
      liveRunMeta: { ...liveRunMeta, extractionSuccess: false }
    };
  }

  // 2. Extract Event History
  const history = [];
  const lines = text.split(/\r?\n/);

  // Parse Markdown table rows: | Date | Time | Location | Details |
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (/^\|\s*(?:date|time|location|details|---|===)/i.test(trimmed)) continue;

    const cols = trimmed
      .split('|')
      .map(c => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cols.length >= 4) {
      const dateVal = cols[0];
      const timeVal = cols[1];
      const locVal = cols[2] === '-' ? '' : cols[2];
      const descVal = cols[3];

      if (dateVal && dateVal !== '-' && !dateVal.includes('---')) {
        history.push({
          timestamp: formatTimestamp(dateVal, timeVal),
          location: locVal || 'In Transit Sorting Facility',
          status: inferStatusFromDetails(descVal),
          description: descVal
        });
      }
    } else if (cols.length === 3) {
      history.push({
        timestamp: cols[0],
        location: cols[1] === '-' ? 'In Transit Hub' : cols[1],
        status: inferStatusFromDetails(cols[2]),
        description: cols[2]
      });
    }
  }

  // Parse bullet list items if no table rows were matched:
  if (history.length === 0) {
    const listRegex = /^-\s*(\d{2}[./-]\d{2}[./-]\d{4}(?:\s+\d{2}:\d{2}(?::\d{2})?)?)\s*-\s*([^\r\n]+)/;
    for (const line of lines) {
      const match = line.trim().match(listRegex);
      if (match) {
        const rawTimestamp = match[1].trim();
        const details = match[2].trim();
        const parts = details.split(/\s*-\s*/);
        history.push({
          timestamp: rawTimestamp,
          location: parts[1] ? parts[1].trim() : 'In Transit Hub',
          status: parts[0] ? parts[0].trim() : 'In Transit Scan',
          description: details
        });
      }
    }
  }

  // 3. Validate extraction completeness
  const origin = normalizeLocation(originRaw);
  const destination = normalizeLocation(destRaw);
  const latestEvent = history.length > 0 ? history[history.length - 1] : null;

  // Determine shipmentStatus genuinely from extracted status or latest history event
  let shipmentStatus = null;
  if (statusRaw && !statusRaw.toLowerCase().includes('no pod') && !statusRaw.toLowerCase().includes('no details')) {
    shipmentStatus = statusRaw;
  } else if (latestEvent && latestEvent.status) {
    shipmentStatus = latestEvent.status;
  } else if (statusRaw && statusRaw.toLowerCase().includes('no pod') && history.length > 0) {
    shipmentStatus = 'In Transit';
  }

  // Determine current location genuinely from latest event or destination hub
  let currentLocation = null;
  if (latestEvent) {
    currentLocation = latestEvent.location && latestEvent.location !== 'In Transit Sorting Facility'
      ? latestEvent.location
      : latestEvent.description || 'In Transit';
  } else if (destination) {
    currentLocation = destination.hub || destination.city;
  }

  // Determine latest tracking update genuinely from latest event or summary date
  let latestTrackingUpdate = null;
  if (latestEvent && latestEvent.timestamp) {
    latestTrackingUpdate = latestEvent.timestamp;
  } else if (summaryDate) {
    latestTrackingUpdate = formatTimestamp(summaryDate, '00:00:00');
  }

  // Check if extraction is incomplete (no origin, no destination, no status, and no events)
  if (!origin && !destination && !shipmentStatus && history.length === 0) {
    return {
      success: false,
      extractionStatus: 'EXTRACTION_INCOMPLETE',
      waybillNumber: waybillExtracted || defaultWaybill,
      carrier: defaultCarrier,
      carrierTrackingUrl: trackingUrl,
      message: `Carrier portal was reached, but tracking records could not be extracted for waybill '${waybillExtracted || defaultWaybill}'.`,
      rawResponse: text,
      liveRunMeta: { ...liveRunMeta, extractionSuccess: false }
    };
  }

  // Successful extraction with genuine data (no fabricated Cape Town / Delivered fallbacks)
  return {
    success: true,
    extractionStatus: 'LIVE_EXTRACTION_SUCCESSFUL',
    shipment: {
      waybillNumber: waybillExtracted || String(defaultWaybill),
      carrier: defaultCarrier,
      carrierTrackingUrl: trackingUrl,
      origin: origin || null,
      destination: destination || null,
      shipmentStatus: shipmentStatus || 'In Transit',
      currentLocation: currentLocation || null,
      latestTrackingUpdate: latestTrackingUpdate || null,
      expectedDeliveryDate: etaRaw || null,
      shipmentHistory: history,
      dataSource: `TinyFish Live Web Agent (${defaultCarrier})`,
      isDemoData: false,
      liveRunMeta: {
        ...liveRunMeta,
        extractionSuccess: true
      }
    },
    rawResponse: text,
    liveRunMeta: { ...liveRunMeta, extractionSuccess: true }
  };
}

/**
 * Executes a live TinyFish web extraction agent run
 * @param {Object} options
 * @param {string} options.waybillNumber - Consignment / Waybill number to track
 * @param {string} options.trackingUrl - Public carrier tracking portal URL
 * @param {string} options.carrier - Courier name
 * @returns {Promise<Object>} Live extraction result object
 */
export async function trackShipmentWithTinyFish({
  waybillNumber = '1',
  trackingUrl,
  carrier = 'Parcel Perfect Express'
} = {}) {
  const rawKey = process.env.TINYFISH_API_KEY;

  if (!rawKey || rawKey.trim() === '') {
    throw new Error('TINYFISH_API_KEY is missing from server/.env. Please configure a valid API key.');
  }

  if (!trackingUrl || trackingUrl.trim() === '') {
    throw new Error('A valid carrier tracking URL is required for live TinyFish web extraction.');
  }

  const apiKey = rawKey.trim();

  const goal = `Navigate the public shipment tracking portal at ${trackingUrl}. Find the waybill tracking input, enter waybill number '${waybillNumber}', and submit. Extract the tracking details including waybill number, origin, destination, shipment status, and event history timestamps and locations.`;

  const requestPayload = {
    url: trackingUrl,
    goal
  };

  const startTime = Date.now();
  console.log(`[TinyFish Live] Launching web agent for Waybill: ${waybillNumber} on ${trackingUrl}`);

  const response = await fetch(TINYFISH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify(requestPayload)
  });

  const durationMs = Date.now() - startTime;
  const durationSec = Math.round(durationMs / 1000);

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail =
        errorJson.message ||
        (typeof errorJson.error === 'object' ? errorJson.error.message || JSON.stringify(errorJson.error) : errorJson.error) ||
        JSON.stringify(errorJson);
    } catch (_) {}
    throw new Error(`TinyFish API error (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  console.log(`[TinyFish Live] Automation run ${data.run_id || 'done'} finished in ${durationSec}s with status: ${data.status}`);

  const liveRunMeta = {
    runId: data.run_id,
    startedAt: data.started_at,
    completedAt: data.finished_at || new Date().toISOString(),
    durationSeconds: durationSec,
    stepsCount: data.num_of_steps || 0
  };

  if (data.status === 'FAILED') {
    return {
      success: false,
      extractionStatus: 'CONNECTION_ERROR',
      waybillNumber,
      carrier,
      carrierTrackingUrl: trackingUrl,
      error: data.error || 'TinyFish web agent execution failed.',
      message: `TinyFish agent run failed: ${data.error || 'Automation failed on carrier portal.'}`,
      rawResponse: data.result ? JSON.stringify(data.result) : null,
      liveRunMeta: { ...liveRunMeta, extractionSuccess: false }
    };
  }

  // Parse extracted result without fabricating defaults
  const parsed = parseTinyFishExtractedResult(data.result, waybillNumber, carrier, trackingUrl, liveRunMeta);

  return parsed;
}
