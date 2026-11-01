# OrderOS — AI-Powered Order & Shipment Intelligence MVP

OrderOS is a modern, lightweight order management dashboard and logistics intelligence platform built for hackathon evaluation. It ingests structured shipment tracking payloads extracted via **TinyFish** and runs an **AI Shipment Intelligence Engine** to proactively detect logistics risks before customers are affected.

---

## 🚀 Key Features by Task

### ✅ TASK 1: Modern Frontend & Backend Architecture
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Lucide Icons. High-contrast, dark-mode supply chain operations interface with responsive layouts.
- **Backend**: Node.js + Express REST API with automated request logging, CORS, and modular architecture.
- **Data Isolation**: Sample demo tracking data extracted via the **TinyFish Playground** is clearly isolated with transparent disclaimer badges. No demo data is misrepresented as live tracking.

### ✅ TASK 2: Order Management Dashboard
- **Executive Metric Cards**:
  - **Total Orders**
  - **Processing Orders** (Supplier stage)
  - **Dispatched Orders** (Carrier linehaul stage)
  - **Potentially Delayed Orders** (SLA at risk)
- **Interactive Filtering**: Filter by fulfillment status, SLA delay risks, or specific AI anomaly categories.
- **Global Search**: Search instantly across Customer Order IDs, Supplier Order IDs, Waybill numbers, customer names, and carrier partners.

### ✅ TASK 3: Detailed Order & Tracking Page
- **Customer Information**: Contact name, enterprise name, email, phone, and complete delivery destination address.
- **Supplier Information**: Supplier business name, dispatch contact lead, contact info, warehouse origin facility, and supplier SKU.
- **Order Identifiers**: Linked **Customer Order ID** (e.g., `ORD-2026-1049`) and **Supplier Order ID** (e.g., `SUP-88210-BLR`).
- **Shipment Information (TinyFish Payload)**: Carrier, Waybill number with quick-copy, Origin, Destination, Current Location, Shipment Status, Latest Tracking Update timestamp, and Expected Delivery Date (ETA).
- **Tracking History**: Interactive chronological milestone timeline featuring status checkpoints, timestamps, locations, and carrier event remarks.

### ✅ TASK 4: AI Shipment Intelligence Module
Evaluates structured tracking JSON and detects:
1. ⏳ **Stale Tracking Updates**: Flags scan blackouts where no carrier scan has occurred for >36h (Warning) or >60h (Critical).
2. ⚠️ **Potentially Delayed Shipments**: Identifies shipments overdue past their ETA, high-velocity bottlenecks (<24h to ETA but stranded at origin), and carrier-reported exception events (weather, breakdowns, customs).
3. 🔀 **Conflicting Status Information**: Catches state discrepancies such as carrier headers marked "Delivered" when checkpoint scans show package still sorting in another city, or ERP processing states desynchronized with carrier waybills.
4. ❓ **Missing Delivery Information**: Flags unassigned/placeholder waybill numbers, missing ETA dates, incomplete destinations, or empty tracking history logs.
5. 🛡️ **Composite Risk Scoring**: Produces an operational Risk Score (0-100) and priority level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with prescribed operational action recommendations.

---

## 📐 TinyFish Tracking Data Schema

The tracking payload adheres directly to the 7 fields extracted by TinyFish:
```json
{
  "waybillNumber": "WB-982344192",
  "carrier": "BlueDart Apex Express",
  "origin": {
    "city": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "hub": "MAA Airport Logistics Facility"
  },
  "destination": {
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "hub": "BLR Tech Center Delivery Hub"
  },
  "shipmentStatus": "In Transit",
  "currentLocation": "Hosur Transit Gateway, Tamil Nadu",
  "latestTrackingUpdate": "2026-11-01T08:30:00Z",
  "expectedDeliveryDate": "2026-11-02T16:00:00Z",
  "shipmentHistory": [
    {
      "timestamp": "2026-10-29T14:20:00Z",
      "location": "Chennai Hub - Gate 4",
      "status": "Shipment Picked Up",
      "description": "Consignment handed over by supplier warehouse."
    }
  ]
}
```

---

## ⚡ Quick Start

### 1. Start Both Frontend & Backend Concurrently
From the project root:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard**: `http://localhost:3000`

### 2. Or Start Individually

**Backend Server**:
```bash
cd server
npm run dev
```

**Frontend Client**:
```bash
cd client
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and MVP mode confirmation |
| `GET` | `/api/orders` | Retrieves all orders enriched with AI Intelligence and KPI metrics |
| `GET` | `/api/orders?status=processing` | Filters by status (`processing` or `dispatched`) |
| `GET` | `/api/orders?filterType=delayed` | Filters by delay risk (`delayed`, `stale`, `conflicting`, `missing`) |
| `GET` | `/api/orders/:id` | Detailed order profile, customer, supplier, tracking, & AI report |
| `POST` | `/api/orders/intelligence/analyze` | On-the-fly AI analysis on any custom tracking JSON payload |

