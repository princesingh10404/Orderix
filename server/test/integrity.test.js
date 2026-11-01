import { parseTinyFishExtractedResult } from '../src/tinyfish.js';

const BASE_URL = 'http://localhost:5000';

async function runVerification() {
  console.log('======================================================');
  console.log('ORDERIX DATA INTEGRITY VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} -> ${details}`);
    }
  }

  // TEST 1: Parse WB-PENDING-ALLOC Not Found Response
  console.log('\n--- TEST GROUP 1: Parser Integrity with WB-PENDING-ALLOC ---');
  const notFoundRawPayload = {
    result: `I successfully navigated the Parcel Perfect public shipment tracking portal at http://tracking.parcelperfect.com/3364.3364.3364/ (accessed via https://parcelperfect.com/demo). I entered the waybill number 'WB-PENDING-ALLOC' into the waybill input field and submitted it.

**Tracking Result:**
- **Waybill Number:** WB-PENDING-ALLOC
- **Origin:** No details found!
- **Destination:** No details found!
- **Shipment Status:** No details found!
- **Event History:** No event history available

The tracking portal returned "No details found!" for this waybill number. This is expected behavior since 'WB-PENDING-ALLOC' is a placeholder/testing waybill number used for demo purposes, and the system has no actual shipment data associated with it.`
  };

  const parsedNotFound = parseTinyFishExtractedResult(
    notFoundRawPayload,
    'WB-PENDING-ALLOC',
    'BlueDart Surface Logistics',
    'https://parcelperfect.com/tracking-demo/'
  );

  assert(parsedNotFound.success === false, 'Parser reports success: false for WB-PENDING-ALLOC');
  assert(parsedNotFound.extractionStatus === 'WAYBILL_NOT_FOUND', 'Parser returns extractionStatus: WAYBILL_NOT_FOUND');
  assert(parsedNotFound.shipment === undefined, 'No fabricated shipment object returned');
  assert(!parsedNotFound.message.includes('Delivered'), 'Message does not hallucinate Delivered status');
  assert(parsedNotFound.waybillNumber === 'WB-PENDING-ALLOC', 'Preserves requested waybillNumber');

  // TEST 2: Parse Valid Sandbox Waybill #1 Extraction
  console.log('\n--- TEST GROUP 2: Parser Extraction for Valid Sandbox Waybill #1 ---');
  const validSandboxRaw = {
    result: `## Tracking Details for Waybill #1

### Shipment Summary
- **Waybill Number:** 1
- **Date:** 10.07.2017
- **Consignee:** PPOnline Testing
- **Service Type:** ONX
- **Origin Hub:** CPT
- **Destination Hub:** CPT
- **Piece Count:** 1
- **POD Status:** No POD

### Event History

| Date | Time | Location | Details |
|------|------|----------|---------|
| 21.09.2020 | 15:11:02 | - | Entered into overnight domestic system for delivery |
| 21.09.2020 | 15:53:26 | - | Collected from origin address |
| 18.06.2024 | 15:30:00 | - | In transit |
| 29.06.2024 | 09:13:04 | Paris facility | Checked in at Paris facility |
| 27.07.2026 | 16:00:40 | Paris facility | Released from Customs |`
  };

  const parsedValid = parseTinyFishExtractedResult(
    validSandboxRaw,
    '1',
    'Parcel Perfect Express',
    'https://parcelperfect.com/tracking-demo/'
  );

  assert(parsedValid.success === true, 'Parser reports success: true for Waybill 1');
  assert(parsedValid.extractionStatus === 'LIVE_EXTRACTION_SUCCESSFUL', 'Parser returns extractionStatus: LIVE_EXTRACTION_SUCCESSFUL');
  assert(parsedValid.shipment?.origin?.city === 'Cape Town', 'Origin hub CPT normalized to Cape Town because it was extracted');
  assert(parsedValid.shipment?.destination?.city === 'Cape Town', 'Destination hub CPT normalized to Cape Town because it was extracted');
  assert(parsedValid.shipment?.currentLocation === 'Paris facility', 'Current location genuinely extracted from latest event (Paris facility)');
  assert(parsedValid.shipment?.shipmentStatus === 'Released from Customs', 'Status genuinely determined from latest milestone');
  assert(parsedValid.shipment?.shipmentHistory?.length === 5, 'Event history has exactly 5 genuine milestones extracted from table');
  assert(parsedValid.shipment?.isDemoData === false, 'isDemoData is false for live extracted payload');

  // TEST 3: Carrier Validation & Safeguards
  console.log('\n--- TEST GROUP 3: Carrier Validation & Safeguards ---');

  // ord-106 without URL
  const rMissingUrl = await fetch(`${BASE_URL}/api/orders/tinyfish/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: 'ord-106' })
  });
  const dMissingUrl = await rMissingUrl.json();
  assert(rMissingUrl.status === 400, 'Rejects ord-106 tracking when carrier tracking URL is missing (HTTP 400)');
  assert(dMissingUrl.extractionStatus === 'UNSUPPORTED_CARRIER', 'Returns extractionStatus: UNSUPPORTED_CARRIER');

  // ord-106 with forced cross-carrier sandbox URL
  const rMismatch = await fetch(`${BASE_URL}/api/orders/tinyfish/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-106',
      carrier: 'BlueDart Surface Logistics',
      trackingUrl: 'https://parcelperfect.com/tracking-demo/'
    })
  });
  const dMismatch = await rMismatch.json();
  assert(rMismatch.status === 400, 'Rejects BlueDart order attempting to track on Parcel Perfect Sandbox (HTTP 400)');
  assert(dMismatch.error.includes('Carrier configuration error'), 'Returns clear carrier configuration error message');

  // TEST 4: Order Immutability on Failure (ord-106 remains untouched)
  console.log('\n--- TEST GROUP 4: Order Immutability on Failure ---');
  const rCheck = await fetch(`${BASE_URL}/api/orders/ord-106`);
  const dCheck = await rCheck.json();
  const order106 = dCheck.data.order;

  assert(order106.orderStatus === 'Processing', `ord-106 orderStatus is preserved as 'Processing' (got '${order106.orderStatus}')`);
  assert(order106.shipment.carrier === 'BlueDart Surface Logistics', 'Carrier preserved as BlueDart Surface Logistics');
  assert(order106.shipment.origin.city === 'Chennai', 'Origin city preserved as Chennai (NOT Cape Town)');
  assert(order106.shipment.destination.city === 'Bengaluru', 'Destination city preserved as Bengaluru (NOT Cape Town)');
  assert(order106.shipment.carrierTrackingUrl === null, 'carrierTrackingUrl remains null');
  assert(order106.shipment.isDemoData === true, 'isDemoData remains true (not marked as live)');

  // TEST 5: Backend API Health and Order Retrieval
  console.log('\n--- TEST GROUP 5: Overall Backend API Health ---');
  const rHealth = await fetch(`${BASE_URL}/api/health`);
  const dHealth = await rHealth.json();
  assert(rHealth.status === 200 && dHealth.status === 'healthy', 'Health check endpoint returns HTTP 200 and status: healthy');

  const rOrders = await fetch(`${BASE_URL}/api/orders`);
  const dOrders = await rOrders.json();
  assert(rOrders.status === 200 && Array.isArray(dOrders.data.orders), 'All orders endpoint returns 200 with orders array');

  console.log('\n======================================================');
  console.log(`FINAL RESULT: ${passed} / ${total} tests passed!`);
  console.log('======================================================\n');
  
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();

