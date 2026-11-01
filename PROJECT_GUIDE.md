# OrderOS — Project Guide & Architecture Handbook

> A beginner-friendly, comprehensive guide to understanding what **OrderOS** does, how it works behind the scenes, and how all its pieces fit together.

---

## 📖 Table of Contents
1. [What OrderOS Does and What Problem It Solves](#1-what-orderos-does-and-what-problem-it-solves)
2. [How the Frontend, Backend, and API Communicate](#2-how-the-frontend-backend-and-api-communicate)
3. [Folder Structure & Key File Map](#3-folder-structure--key-file-map)
4. [How Order Data is Stored and Retrieved](#4-how-order-data-is-stored-and-retrieved)
5. [How the AI Shipment Intelligence Engine Works](#5-how-the-ai-shipment-intelligence-engine-works)
6. [What TinyFish Will Do & How It Will Connect](#6-what-tinyfish-will-do--how-it-will-connect)
7. [The Complete Journey of an Order Through the App](#7-the-complete-journey-of-an-order-through-the-app)
8. [Glossary of Key Technical Terms](#8-glossary-of-key-technical-terms)

---

## 1. What OrderOS Does and What Problem It Solves

### The Real-World Problem
When businesses buy and sell equipment or products, logistics is often messy:
* **Fragmented Carrier Websites**: Different suppliers ship through different couriers (e.g., BlueDart, Delhivery, DHL, FedEx). Logistics coordinators waste hours manually visiting different tracking websites and typing in tracking numbers one by one.
* **Silent Bottlenecks**: A package can sit in a transit hub for 3 days with no updates. Nobody notices until the customer calls asking, *"Where is my package?"*
* **Misleading Statuses**: A courier website might say *"Delivered"* on the main header, but if you look closely at the scan log, the package is actually sitting in a sorting warehouse 200 miles away.
* **Missing Information**: Couriers frequently fail to provide an Expected Delivery Date (ETA), leaving customers in the dark.

### The OrderOS Solution
**OrderOS** is a centralized **Order Management Dashboard** combined with an **AI Shipment Intelligence Engine**:
1. **Single Pane of Glass**: It brings customer information, supplier details, internal order IDs, and carrier tracking into one unified dashboard.
2. **Proactive Risk Detection**: Rather than waiting for someone to manually spot an issue, an automated intelligence engine analyzes the tracking data and raises flags (e.g., *Stale Tracking*, *Overdue ETA*, *Conflicting Status*, or *Missing Delivery Data*).
3. **Prepared for TinyFish**: It is structured to consume automated web-extracted tracking JSON payloads produced by **TinyFish**, eliminating manual courier portal checks.

---

## 2. How the Frontend, Backend, and API Communicate

OrderOS uses a standard **Client-Server Architecture**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      WEB BROWSER                            │
 │                                                             │
 │   User interacts with OrderOS Dashboard (React + Tailwind)   │
 │   Runs locally at: http://localhost:3000                    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                │ 1. Browser makes an HTTP request
                                │    e.g. GET /api/orders
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 VITE DEVELOPMENT PROXY                      │
 │                                                             │
 │   Catches any URL starting with "/api" and forwards it to   │
 │   the backend server without triggering CORS errors.        │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                │ 2. Forwards request
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                EXPRESS BACKEND SERVER                       │
 │                                                             │
 │   Runs locally at: http://localhost:5000                    │
 │   • server/src/routes/orders.js                             │
 │   • Enriches orders with AI Shipment Intelligence           │
 │   • Computes KPI dashboard metrics                          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                │ 3. Returns structured JSON data
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      WEB BROWSER                            │
 │                                                             │
 │   React receives the JSON response, updates state, and      │
 │   renders interactive KPI cards, order tables, & timelines. │
 └─────────────────────────────────────────────────────────────┘
```

### In Plain Terms:
* **Frontend (`client/`)**: This is the visual interface you see in your browser (buttons, colors, tables, charts).
* **Backend (`server/`)**: This is the invisible server running in the background. It holds the data, runs the intelligence rules, and responds to requests.
* **API (Application Programming Interface)**: The bridge between frontend and backend. When the frontend needs data, it sends an **HTTP request** (like a letter in the mail) to an **API endpoint** (like `/api/orders`), and the backend replies with a **JSON payload** (the letter's contents).
* **Vite Proxy (`client/vite.config.js`)**: A local routing helper. It allows the frontend on port 3000 to talk to port 5000 seamlessly without security restrictions.

---

## 3. Folder Structure & Key File Map

Here is how the project files are organized:

```
Orderix/
├── package.json               # Root manager; runs both frontend and backend together
├── README.md                  # Project overview and hackathon specifications
├── PROJECT_GUIDE.md           # This comprehensive guide
├── server/                    # Node.js + Express Backend
│   ├── package.json           # Backend dependencies (express, cors, dotenv)
│   └── src/
│       ├── index.js           # Entry point: starts the Express server on port 5000
│       ├── intelligence.js    # The AI Shipment Intelligence logic and rules
│       ├── data/
│       │   └── demoOrders.js  # Sample order records with TinyFish tracking payloads
│       └── routes/
│           └── orders.js      # API endpoints for orders, filters, and custom analysis
└── client/                    # React + Vite Frontend
    ├── package.json           # Frontend dependencies (react, lucide-react, tailwindcss)
    ├── vite.config.js         # Vite configuration & /api reverse proxy to port 5000
    ├── index.html             # Single-page HTML container with typography & dark theme
    └── src/
        ├── main.jsx           # Mounts the React application into index.html
        ├── index.css          # Global styling & Tailwind CSS v4 directives
        ├── App.jsx            # Main app controller; coordinates views, filters, & state
        ├── services/
        │   └── api.js         # Functions (fetchOrders, fetchOrderById) that call the API
        └── components/
            ├── Navbar.jsx               # Top header with logo, search, and mode badges
            ├── DemoDisclaimerBanner.jsx # Notice explaining data is demo mode (TinyFish)
            ├── MetricCards.jsx          # 4 required KPI metric cards + category filters
            ├── IntelligenceOverview.jsx # Executive panel explaining the 4 AI vectors
            ├── OrderList.jsx            # Main data table showing all orders and risk pills
            ├── OrderDetail.jsx          # Deep-dive order view (Customer, Supplier, Tracking)
            └── RawJsonModal.jsx         # Modal to view extracted JSON or test live inputs
```

---

## 4. How Order Data is Stored and Retrieved

### Current Implementation: In-Memory Storage
In the current MVP:
1. All order data is stored in memory (RAM) in the backend server.
2. The initial dataset is loaded from [`server/src/data/demoOrders.js`](file:///c:/Users/princ/OneDrive/Documents/Orderix/server/src/data/demoOrders.js).
3. When [`server/src/routes/orders.js`](file:///c:/Users/princ/OneDrive/Documents/Orderix/server/src/routes/orders.js) starts, it creates a working copy of this array:
   ```javascript
   let orders = JSON.parse(JSON.stringify(demoOrders));
   ```

### Why In-Memory for a Hackathon MVP?
* **Zero Database Setup**: No need to install, configure, or migrate a heavy database (like PostgreSQL or MongoDB) during rapid prototyping.
* **Instant Speed**: Reading and filtering in memory takes less than 2 milliseconds.
* **Data Safety**: If demo data is ever modified during a session, restarting the server immediately restores the clean state.

### How Data Retrieval Works (Step-by-Step):
1. **Frontend Request**: The React app makes a call:
   ```javascript
   fetch('/api/orders?filterType=delayed')
   ```
2. **Dynamic AI Enrichment**: Before returning any data, the backend loops over each order using `.map()` and passes it into `analyzeShipmentIntelligence(order)`.
3. **KPI Metric Aggregation**: The backend calculates overall dashboard counts:
   * `totalOrders`: Total number of orders.
   * `processingOrders`: Orders where status is `"Processing"`.
   * `dispatchedOrders`: Orders where status is `"Dispatched"`.
   * `potentiallyDelayedOrders`: Orders where the AI detected delivery risks.
4. **Filtering & Searching**: If the user typed a search term (e.g., *"Aarav"*) or clicked a filter (e.g., *"Delayed"*), the backend filters the list.
5. **JSON Response**: The filtered list and KPI metrics are sent back to the browser as a JSON object.

---

## 5. How the AI Shipment Intelligence Engine Works

The intelligence engine lives in [`server/src/intelligence.js`](file:///c:/Users/princ/OneDrive/Documents/Orderix/server/src/intelligence.js).

Instead of an unpredictable black-box chatbot, this is a **deterministic heuristic rules engine**. It systematically evaluates the tracking data against **4 distinct operational risk vectors** and computes a composite **Risk Score (0 to 100)**:

```
0-24: LOW RISK (Green)  ───► 25-49: MEDIUM RISK (Yellow)  ───► 50-74: HIGH RISK (Amber)  ───► 75-100: CRITICAL (Rose)
```

Here is exactly how the 4 detection vectors work with examples from our dataset:

---

### Vector 1: Stale Tracking Updates
* **What it checks**: How much time has passed between the carrier's `latestTrackingUpdate` timestamp and the current time.
* **The Rule**:
  * If elapsed time $\ge$ 36 hours: Flag **MEDIUM** risk (*Potential stall detected*).
  * If elapsed time $\ge$ 60 hours: Flag **HIGH** risk (*Scan blackout; package may be lost or stuck at dock*).
* **Real Project Example (`ORD-2026-1050`)**:
  * Consignment left Mumbai for Gurugram.
  * Latest scan at Bhopal Regional Hub occurred **70 hours ago**.
  * **Result**: AI flags `Prolonged Tracking Stagnation (>60h)` and recommends contacting the carrier dock supervisor.

---

### Vector 2: Potentially Delayed Shipments
* **What it checks**: Compares `expectedDeliveryDate` (ETA) against the current date, scans for bottleneck velocity, and inspects scan descriptions for delay keywords (e.g., *breakdown*, *weather*, *congestion*, *customs hold*).
* **The Rule**:
  * If current time $>$ expected delivery date: Flag **OVERDUE** delay.
  * If ETA is $<24$ hours away, but the package is still at the origin hub: Flag **HIGH VELOCITY RISK**.
  * If milestone text mentions an exception: Flag **OPERATIONAL EXCEPTION**.
* **Real Project Example (`ORD-2026-1051`)**:
  * Medical valves shipped from Hyderabad to Delhi.
  * Expected delivery was **October 30, 2026**.
  * Current date is **November 1, 2026** (2 days overdue).
  * Checkpoint scan reveals: *"Severe vehicle breakdown on NH44 corridor."*
  * **Result**: AI flags `Shipment Overdue by 2 Days` + `Carrier Operational Exception Logged`.

---

### Vector 3: Conflicting Status Information
* **What it checks**: Cross-references the carrier's high-level status against the individual scan events, geographic location, and internal company order status.
* **The Rule**:
  * If carrier summary says `"Delivered"`, but the latest scan event is `"Awaiting Sorting"` in a different city: Flag **CRITICAL CONFLICT** (premature delivery scan).
  * If internal order status is `"Processing"` (warehouse hasn't packed it yet), but carrier tracking says `"In Transit"`: Flag **STATE DESYNC**.
* **Real Project Example (`ORD-2026-1052`)**:
  * Destination is Ahmedabad, Gujarat.
  * Carrier status header says: `"Delivered"`.
  * However, the latest scan checkpoint shows: `"Surat Sorting Hub, Gujarat — Awaiting Sorting"`.
  * **Result**: AI flags `Premature Delivery Confirmation Discrepancy` (Score: 55/100, High Risk) and warns the operator that the package has not actually reached the customer.

---

### Vector 4: Missing Delivery Information
* **What it checks**: Verifies that the extracted tracking payload contains the mandatory operational data needed to manage the shipment.
* **The Rule**:
  * Checks if `expectedDeliveryDate` is missing or `null`.
  * Checks if `waybillNumber` is missing or contains placeholder text like `"UNASSIGNED"`.
  * Checks if `destination.city` is blank.
* **Real Project Example (`ORD-2026-1053`)**:
  * Dispatched order with waybill `"WB-UNASSIGNED-884"`.
  * `expectedDeliveryDate` is `null` (carrier didn't specify).
  * Destination city is blank `""`.
  * **Result**: AI flags `Incomplete Tracking Telemetry (3 missing fields)` and alerts operators to obtain carrier documentation.

---

## 6. TinyFish Live Integration & Sandbox Execution

### What is TinyFish?
**TinyFish** is an AI web automation agent. You give it a courier tracking portal URL and a tracking number, and it:
1. Spawns an automated browser session in an isolated microVM.
2. Navigates the public tracking page, locates the tracking input, and submits the waybill number.
3. Observes and extracts tracking milestones, current location, statuses, and delivery dates.
4. Returns clean, structured JSON conforming to the OrderOS 7-field schema.

### Current Implementation Status: **LIVE & OPERATIONAL**
* **Authentication**: Uses `process.env.TINYFISH_API_KEY` loaded securely via `dotenv` from `server/.env`. The key is completely isolated and never exposed to the frontend, logs, or Git.
* **Service Module**: Built in [`server/src/tinyfish.js`](file:///c:/Users/princ/OneDrive/Documents/Orderix/server/src/tinyfish.js) using the official `POST https://agent.tinyfish.ai/v1/automation/run` endpoint and `X-API-Key` authentication.
* **Sandbox Verification**: Tested and verified using the **Parcel Perfect Sandbox** (`https://parcelperfect.com/tracking-demo/`) with **Waybill `1`**. The live agent executed 10-13 browser steps, extracted the full milestone history, and confirmed status `"Delivered"` in Cape Town.
* **Instant Intelligence Loop**: When TinyFish returns live tracking data, OrderOS immediately feeds it into the `analyzeShipmentIntelligence()` engine, updating the risk score, risk level, and timeline milestones in real time.

```
[ Parcel Perfect Public Portal ]
       ▲
       │ TinyFish Cloud Browser Navigates
[ TinyFish Agent API (https://agent.tinyfish.ai) ]
       │
       │ HTTP POST /v1/automation/run (X-API-Key)
       ▼
[ OrderOS Backend Service (server/src/tinyfish.js) ]
       │
       │ Normalizes into 7-field schema
       ▼
[ AI Shipment Intelligence (server/src/intelligence.js) ]
       │
       │ Evaluates risk & updates in-memory order
       ▼
[ OrderOS Dashboard & Details View (Live Badge) ]
```

---

## 7. The Complete Journey of an Order Through the App

Here is the exact lifecycle of an order from when the user visits the app:

```
 1. PAGE LOAD
    • User opens http://localhost:3000
    • React mounts App.jsx and triggers loadOrders()

 2. API REQUEST
    • App.jsx calls fetchOrders() in api.js
    • Request travels: Browser ──► Vite Proxy (:3000) ──► Express (:5000/api/orders)

 3. INTELLIGENCE ANALYSIS
    • Express iterates through demoOrders
    • server/src/intelligence.js evaluates all 4 risk vectors for each order
    • Calculates risk scores (0-100), risk levels (LOW/MED/HIGH/CRITICAL), and flags
    • Express compiles overall KPI metrics (Total: 8, Processing: 2, Dispatched: 6, Delayed: 4)

 4. DASHBOARD PRESENTATION
    • React receives JSON data
    • MetricCards.jsx renders the 4 top KPI cards
    • IntelligenceOverview.jsx renders the AI vector summary
    • OrderList.jsx renders the table with color-coded risk badges

 5. USER INTERACTION
    • User clicks "Potentially Delayed" KPI card ──► Table instantly filters to show only at-risk orders
    • User types "Aarav" into the search bar ──► Table filters in real-time
    • User clicks "Details" on Order ORD-2026-1049 ──► Dashboard switches to OrderDetail.jsx

 6. DEEP DIVE & RAW INSPECTION
    • OrderDetail.jsx displays Customer Card, Supplier Card, Shipment Telemetry, & AI Diagnostic
    • Milestone timeline displays all past carrier scans with status dots
    • User clicks "Inspect Extracted JSON" ──► RawJsonModal.jsx opens, showing the exact
      TinyFish JSON payload and providing a Live AI Tester to experiment with custom payloads
```

---

## 8. Glossary of Key Technical Terms

| Term | Everyday Meaning | Example in OrderOS |
|---|---|---|
| **Frontend** | The visual user interface that runs inside the user's web browser. | Everything in the `client/` folder (React, Tailwind buttons, tables). |
| **Backend** | The background engine running on the server that handles logic, data, and security. | Everything in the `server/` folder (Express server, intelligence logic). |
| **API (Application Programming Interface)** | A formal agreement and channel allowing the frontend and backend to talk to each other. | `/api/orders` endpoint that returns order data upon request. |
| **Endpoint** | A specific web address on the backend dedicated to a specific task. | `GET /api/orders/ord-101` fetches details for order 101. |
| **JSON (JavaScript Object Notation)** | A standardized text format for sending structured data across the web. | `{ "waybillNumber": "WB-982344192", "status": "In Transit" }` |
| **HTTP Request (GET / POST)** | How computers ask for things on the web. `GET` means *"retrieve data"*, `POST` means *"send data"*. | `GET /api/orders` retrieves orders; `POST /api/orders/intelligence/analyze` sends a payload for analysis. |
| **Reverse Proxy** | A local forwarding service that relays requests between different ports on a computer. | Vite's proxy redirecting `/api` from port 3000 to port 5000. |
| **CORS (Cross-Origin Resource Sharing)** | A browser security rule that blocks websites on one port from talking to another port without permission. | Handled cleanly in our backend via Express's `cors()` middleware. |
| **Waybill / Air Waybill (AWB)** | The unique tracking number issued by a courier to identify and track a parcel. | `"WB-982344192"` on BlueDart. |
| **ETA (Estimated Time of Arrival)** | The expected date and time a shipment should reach the recipient. | `"2026-11-02T16:00:00Z"` |
| **SLA (Service Level Agreement)** | The promised delivery standard or deadline agreed between business, supplier, and courier. | Delivering within 48 hours of dispatch. |
| **Heuristic Rules Engine** | An algorithmic decision system that uses explicit rules and logic rather than black-box probabilities. | `server/src/intelligence.js` checking if elapsed time $>36$ hours. |
| **In-Memory Storage** | Storing data temporarily in computer RAM rather than on a persistent hard drive database. | Our demo order array initialized when the Node server boots up. |
| **Web Scraping / Extraction** | Automatically reading and extracting data from a public website using code. | What TinyFish does when reading carrier tracking websites. |

---

*This guide was generated specifically for the OrderOS codebase to support hackathon presentations, architecture reviews, and future live TinyFish API integrations.*

