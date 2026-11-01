/**
 * Demo Orders Dataset with TinyFish Structured Tracking Payloads
 * NOTE: This is pre-configured demo data based on real public web extraction tests.
 * In accordance with hackathon MVP specifications, this is explicitly marked as demo data
 * prior to live TinyFish API integration.
 */

export const demoOrders = [
  {
    id: "ord-100",
    customerOrderId: "ORD-2026-PP01",
    supplierOrderId: "SUP-PP-SANDBOX",
    orderDate: "2026-10-31T08:30:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$3,200.00",
    priority: "High",
    items: [
      { name: "High-Pressure Hydraulic Valves", sku: "GIS-ONX-VALVE", quantity: 4, unitPrice: "$650.00" },
      { name: "Flange Connectors 2-inch", sku: "FLG-CONN-2IN", quantity: 6, unitPrice: "$100.00" }
    ],
    customer: {
      name: "Liam Botha",
      company: "Cape Logistics International",
      email: "liam@capelogistics.co.za",
      phone: "+27 21 555 0192",
      shippingAddress: {
        street: "14 Waterfront Way, Foreshore",
        city: "Cape Town",
        state: "Western Cape",
        postalCode: "8001",
        country: "South Africa"
      }
    },
    supplier: {
      name: "Gauteng Industrial Spares",
      contactPerson: "Sipho Ndlovu",
      email: "orders@gautengspares.co.za",
      phone: "+27 11 444 8800",
      warehouse: "Linbro Logistics Park, Johannesburg",
      supplierSku: "GIS-ONX-VALVE"
    },
    shipment: {
      waybillNumber: "1",
      carrier: "Parcel Perfect Express",
      carrierTrackingUrl: "https://parcelperfect.com/tracking-demo/",
      origin: {
        city: "Cape Town",
        state: "Western Cape",
        country: "South Africa",
        hub: "CPT Origin Hub"
      },
      destination: {
        city: "Cape Town",
        state: "Western Cape",
        country: "South Africa",
        hub: "CPT Delivery Station"
      },
      shipmentStatus: "Out for Delivery",
      currentLocation: "Cape Town Regional Transit Facility (CPT)",
      latestTrackingUpdate: "2026-10-31T14:30:00Z",
      expectedDeliveryDate: "2026-11-01T17:00:00Z",
      dataSource: "Parcel Perfect Sandbox (Ready for Live TinyFish Sync)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-30T09:15:00Z",
          location: "Linbro Park, Johannesburg",
          status: "Waybill Created",
          description: "Consignment manifest generated in Parcel Perfect system."
        },
        {
          timestamp: "2026-10-30T14:40:00Z",
          location: "CPT Airport Hub",
          status: "Arrived at Hub",
          description: "Package received and sorted."
        },
        {
          timestamp: "2026-10-31T14:30:00Z",
          location: "Cape Town Regional Transit Facility",
          status: "Processed at Hub",
          description: "Loaded into delivery van. Awaiting final delivery scan."
        }
      ]
    }
  },
  {
    id: "ord-101",
    customerOrderId: "ORD-2026-1049",
    supplierOrderId: "SUP-88210-BLR",
    orderDate: "2026-10-29T10:15:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$4,850.00",
    priority: "High",
    items: [
      { name: "Industrial Edge AI Compute Unit", sku: "EDGE-AI-800", quantity: 5, unitPrice: "$850.00" },
      { name: "High-Gain Dual Band RF Antenna", sku: "ANT-RF-5G", quantity: 10, unitPrice: "$60.00" }
    ],
    customer: {
      name: "Aarav Sharma",
      company: "Apex Dynamics Automation Ltd.",
      email: "aarav.sharma@apexdynamics.io",
      phone: "+91 98201 44321",
      shippingAddress: {
        street: "402 Cyber Tech Park, Phase II, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        country: "India"
      }
    },
    supplier: {
      name: "Silicon Precision Components Pvt. Ltd.",
      contactPerson: "Rajesh Varma (VP Logistics)",
      email: "fulfillment@siliconprecision.com",
      phone: "+91 44 2819 0042",
      warehouse: "Chennai Industrial Corridor Hub - Gate 4",
      supplierSku: "SPC-MICRO-2026-X"
    },
    shipment: {
      waybillNumber: "WB-982344192",
      carrier: "BlueDart Apex Express",
      carrierTrackingUrl: "https://www.bluedart.com/tracking?wb=982344192",
      origin: {
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        hub: "MAA Airport Logistics Facility"
      },
      destination: {
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        hub: "BLR Tech Center Delivery Hub"
      },
      shipmentStatus: "In Transit",
      currentLocation: "Hosur Transit Gateway, Tamil Nadu",
      latestTrackingUpdate: "2026-11-01T08:30:00Z",
      expectedDeliveryDate: "2026-11-02T16:00:00Z",
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-29T14:20:00Z",
          location: "Chennai Hub - Gate 4",
          status: "Shipment Picked Up",
          description: "Consignment handed over by supplier warehouse to BlueDart courier."
        },
        {
          timestamp: "2026-10-29T21:45:00Z",
          location: "MAA Airport Logistics Facility",
          status: "Processed through Sorting Hub",
          description: "Dimensional weight audited and sorted into Inter-City Truck 42B."
        },
        {
          timestamp: "2026-10-31T03:10:00Z",
          location: "Vellore Tollway Checkpost",
          status: "In Transit",
          description: "Linehaul departure recorded on NH48 corridor."
        },
        {
          timestamp: "2026-11-01T08:30:00Z",
          location: "Hosur Transit Gateway, Tamil Nadu",
          status: "Arrived at Hub",
          description: "Container arrived at gateway hub for customs check and vehicle change."
        }
      ]
    }
  },

  {
    id: "ord-102",
    customerOrderId: "ORD-2026-1050",
    supplierOrderId: "SUP-88211-MUM",
    orderDate: "2026-10-26T08:00:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$12,200.00",
    priority: "Critical",
    items: [
      { name: "Precision Servo Motors 2.5kW", sku: "SRV-MTR-25", quantity: 8, unitPrice: "$1,400.00" },
      { name: "Digital Optic Encoders", sku: "ENC-OPT-4K", quantity: 8, unitPrice: "$125.00" }
    ],
    customer: {
      name: "Pooja Singhania",
      company: "Nordic Smart Robotics Inc.",
      email: "pooja.s@nordicrobotics.com",
      phone: "+91 99302 77109",
      shippingAddress: {
        street: "Plot 18, Udyog Vihar Phase 4",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122016",
        country: "India"
      }
    },
    supplier: {
      name: "Maharashtra Industrial Automation Ltd.",
      contactPerson: "Sunil Kadam (Dispatch Lead)",
      email: "orders@mumbai-auto.in",
      phone: "+91 22 6678 1900",
      warehouse: "Bhiwandi Central Fulfillment Depot 3",
      supplierSku: "MIA-SERVO-X7"
    },
    shipment: {
      waybillNumber: "WB-771920834",
      carrier: "Delhivery Freight Linehaul",
      carrierTrackingUrl: "https://www.delhivery.com/track/package/WB-771920834",
      origin: {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        hub: "Bhiwandi Mega Sort Center"
      },
      destination: {
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        hub: "Gurugram NCR Delivery Center"
      },
      shipmentStatus: "In Transit",
      currentLocation: "Bhopal Regional Hub, Madhya Pradesh",
      latestTrackingUpdate: "2026-10-29T10:15:00Z", // Stale: > 70 hours ago!
      expectedDeliveryDate: "2026-11-01T18:00:00Z",
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-26T17:00:00Z",
          location: "Bhiwandi Mega Sort Center",
          status: "Manifest Generated",
          description: "Consignment manifest created and barcode generated."
        },
        {
          timestamp: "2026-10-27T02:30:00Z",
          location: "Bhiwandi Mega Sort Center",
          status: "Departed Facility",
          description: "Vehicle departed toward Central North route."
        },
        {
          timestamp: "2026-10-28T16:45:00Z",
          location: "Dhule Transshipment Depot",
          status: "In Transit Scan",
          description: "En route passage recorded."
        },
        {
          timestamp: "2026-10-29T10:15:00Z",
          location: "Bhopal Regional Hub, Madhya Pradesh",
          status: "Arrived at Sorting Hub",
          description: "Consignment unloaded at regional sorting platform. No forward scan since."
        }
      ]
    }
  },

  {
    id: "ord-103",
    customerOrderId: "ORD-2026-1051",
    supplierOrderId: "SUP-88212-HYD",
    orderDate: "2026-10-24T11:30:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$7,350.00",
    priority: "High",
    items: [
      { name: "Medical Grade Fluidic Valves", sku: "MED-VALVE-90", quantity: 30, unitPrice: "$220.00" },
      { name: "High Pressure Tubing 50m", sku: "TUB-MED-50M", quantity: 5, unitPrice: "$150.00" }
    ],
    customer: {
      name: "Dr. Vikram Seth",
      company: "Apex MedTech Systems",
      email: "v.seth@apexmedtech.org",
      phone: "+91 97118 66200",
      shippingAddress: {
        street: "B-22 Okhla Industrial Area Phase 1",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110020",
        country: "India"
      }
    },
    supplier: {
      name: "Telangana Bio-Precision Instruments",
      contactPerson: "Kavita Rao",
      email: "dispatch@telanganabio.com",
      phone: "+91 40 2300 4881",
      warehouse: "Genome Valley Facility, Hyderabad",
      supplierSku: "TBP-VALV-300"
    },
    shipment: {
      waybillNumber: "WB-664819003",
      carrier: "Gati-KWE Express",
      carrierTrackingUrl: "https://gatikwe.com/track?wb=WB-664819003",
      origin: {
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        hub: "HYD GMR Cargo Hub"
      },
      destination: {
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        hub: "DEL Okhla Express Center"
      },
      shipmentStatus: "In Transit - Delayed",
      currentLocation: "Nagpur Express Hub, Maharashtra",
      latestTrackingUpdate: "2026-11-01T07:15:00Z",
      expectedDeliveryDate: "2026-10-30T17:00:00Z", // OVERDUE by 2 days!
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-24T18:00:00Z",
          location: "Hyderabad GMR Cargo Hub",
          status: "Pickup Completed",
          description: "Package received at origin warehouse."
        },
        {
          timestamp: "2026-10-26T12:00:00Z",
          location: "Adilabad Transit Point",
          status: "In Transit",
          description: "Vehicle transit check logged."
        },
        {
          timestamp: "2026-10-28T22:30:00Z",
          location: "Nagpur Express Hub, Maharashtra",
          status: "Exception / Delay Logged",
          description: "Severe vehicle breakdown on NH44 corridor. Transfer to relief trailer required."
        },
        {
          timestamp: "2026-11-01T07:15:00Z",
          location: "Nagpur Express Hub, Maharashtra",
          status: "Operational Backlog",
          description: "Relief vehicle queued for dock reloading. ETA delayed."
        }
      ]
    }
  },

  {
    id: "ord-104",
    customerOrderId: "ORD-2026-1052",
    supplierOrderId: "SUP-88213-PUN",
    orderDate: "2026-10-27T14:45:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$2,990.00",
    priority: "Medium",
    items: [
      { name: "PLC Controller Modules", sku: "PLC-MOD-X3", quantity: 6, unitPrice: "$450.00" },
      { name: "DIN Rail Mounting Kits", sku: "DIN-RAIL-KIT", quantity: 12, unitPrice: "$24.00" }
    ],
    customer: {
      name: "Sneha Patel",
      company: "Western Fabricators LLP",
      email: "spatel@westernfab.com",
      phone: "+91 98250 11984",
      shippingAddress: {
        street: "GIDC Industrial Estate, Sector 26",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "382028",
        country: "India"
      }
    },
    supplier: {
      name: "Pune Mechatronics Systems",
      contactPerson: "Anand Deshmukh",
      email: "support@punemech.com",
      phone: "+91 20 2712 9000",
      warehouse: "Chakan Industrial Zone B, Pune",
      supplierSku: "PMS-PLC-90"
    },
    shipment: {
      waybillNumber: "WB-552091482",
      carrier: "Safexpress Cargo",
      carrierTrackingUrl: "https://safexpress.com/track?wb=WB-552091482",
      origin: {
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        hub: "Chakan Logistics Depot"
      },
      destination: {
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        hub: "Ahmedabad GIDC Hub"
      },
      shipmentStatus: "Delivered", // CONFLICTING: Header says Delivered!
      currentLocation: "Surat Sorting Hub, Gujarat", // But location is Surat, not destination!
      latestTrackingUpdate: "2026-11-01T09:40:00Z",
      expectedDeliveryDate: "2026-11-03T18:00:00Z",
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-28T09:00:00Z",
          location: "Chakan Logistics Depot, Pune",
          status: "Shipment Picked Up",
          description: "Consignment collected from supplier dock."
        },
        {
          timestamp: "2026-10-29T23:15:00Z",
          location: "Thane Bypass Checkpoint",
          status: "In Transit",
          description: "Linehaul trailer transit scan."
        },
        {
          timestamp: "2026-11-01T09:40:00Z",
          location: "Surat Sorting Hub, Gujarat",
          status: "Arrived at Sort Hub - Awaiting Sorting", // CONFLICT: Not delivered!
          description: "Consignment unloaded at intermediate cross-dock facility in Surat."
        }
      ]
    }
  },

  {
    id: "ord-105",
    customerOrderId: "ORD-2026-1053",
    supplierOrderId: "SUP-88214-NOI",
    orderDate: "2026-10-30T16:20:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$5,120.00",
    priority: "Medium",
    items: [
      { name: "Industrial Ethernet Switches (Managed)", sku: "ETH-SW-16M", quantity: 4, unitPrice: "$1,100.00" },
      { name: "Fiber Patch Cables LC-LC 10m", sku: "FBR-LC-10M", quantity: 12, unitPrice: "$60.00" }
    ],
    customer: {
      name: "Rohan Mukherjee",
      company: "Kolkata Telecom Networks",
      email: "r.mukherjee@kolkatatel.net",
      phone: "+91 98310 99451",
      shippingAddress: {
        street: "Salt Lake Sector V, Block EP & GP",
        city: "Kolkata",
        state: "West Bengal",
        postalCode: "700091",
        country: "India"
      }
    },
    supplier: {
      name: "Northland Optoelectronics",
      contactPerson: "Vipin Saxena",
      email: "fulfillment@northland-opto.com",
      phone: "+91 120 456 7890",
      warehouse: "Noida Phase II Export Zone",
      supplierSku: "NLO-ETH-16"
    },
    shipment: {
      waybillNumber: "WB-UNASSIGNED-884", // MISSING INFO: Waybill placeholder
      carrier: "FedEx Freight Regional",
      carrierTrackingUrl: "https://fedex.com/track?wb=WB-UNASSIGNED-884",
      origin: {
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        hub: "DEL NCR Gateway"
      },
      destination: {
        city: "", // MISSING INFO: Destination city missing!
        state: "West Bengal",
        country: "India",
        hub: "Unspecified Facility"
      },
      shipmentStatus: "Label Created - Awaiting Pickup",
      currentLocation: "Noida Phase II Carrier Center",
      latestTrackingUpdate: "2026-10-31T11:00:00Z",
      expectedDeliveryDate: null, // MISSING INFO: ETA is null
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-31T11:00:00Z",
          location: "Noida Carrier Center",
          status: "Electronic Shipping Info Received",
          description: "Carrier received electronic manifest. Physical package not yet received."
        }
      ]
    }
  },

  {
    id: "ord-106",
    customerOrderId: "ORD-2026-1054",
    supplierOrderId: "SUP-88215-CHE",
    orderDate: "2026-11-01T06:30:00Z",
    orderStatus: "Processing",
    totalAmount: "$1,890.00",
    priority: "Low",
    items: [
      { name: "Aluminium Heat Sinks 120mm", sku: "HS-ALU-120", quantity: 50, unitPrice: "$30.00" },
      { name: "Thermal Conductive Paste 50g", sku: "THM-PST-50G", quantity: 20, unitPrice: "$19.50" }
    ],
    customer: {
      name: "Ananya Roy",
      company: "Thermal Dynamics Labs",
      email: "ananya@thermal-dynamics.com",
      phone: "+91 94330 22188",
      shippingAddress: {
        street: "Plot 44, Electronic City Phase 1",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560100",
        country: "India"
      }
    },
    supplier: {
      name: "Southern Metals & Extrusions",
      contactPerson: "Dinesh Kumar",
      email: "orders@southernmetals.in",
      phone: "+91 44 2490 1122",
      warehouse: "Ambattur Industrial Estate, Chennai",
      supplierSku: "SME-ALU-120"
    },
    shipment: {
      waybillNumber: "WB-PENDING-ALLOC",
      carrier: "BlueDart Surface Logistics",
      carrierTrackingUrl: null,
      origin: {
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        hub: "Ambattur Hub"
      },
      destination: {
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        hub: "Electronic City Delivery Branch"
      },
      shipmentStatus: "Processing at Supplier",
      currentLocation: "Supplier Warehouse (Packing Stage)",
      latestTrackingUpdate: "2026-11-01T07:00:00Z",
      expectedDeliveryDate: "2026-11-05T18:00:00Z",
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-11-01T06:45:00Z",
          location: "Southern Metals Warehouse",
          status: "Order Pick-List Issued",
          description: "Internal warehouse picker assigned. Items staged for quality audit."
        }
      ]
    }
  },

  {
    id: "ord-107",
    customerOrderId: "ORD-2026-1055",
    supplierOrderId: "SUP-88216-AMD",
    orderDate: "2026-10-23T15:00:00Z",
    orderStatus: "Dispatched",
    totalAmount: "$15,400.00",
    priority: "Critical",
    items: [
      { name: "Semiconductor Laser Diodes 808nm", sku: "LSR-DIO-808", quantity: 20, unitPrice: "$700.00" },
      { name: "Optical Collimating Lenses", sku: "OPT-COL-10", quantity: 20, unitPrice: "$70.00" }
    ],
    customer: {
      name: "Karan Johar",
      company: "Photonics Research Systems",
      email: "kj@photonics-india.com",
      phone: "+91 98110 54329",
      shippingAddress: {
        street: "Tech Zone IV, Greater Noida",
        city: "Noida",
        state: "Uttar Pradesh",
        postalCode: "201306",
        country: "India"
      }
    },
    supplier: {
      name: "Gujarat Laser Technologies Ltd.",
      contactPerson: "Bhavin Shah",
      email: "shipping@gujaratlaser.com",
      phone: "+91 79 2656 7711",
      warehouse: "Sanand Industrial Zone, Ahmedabad",
      supplierSku: "GLT-LSR-808"
    },
    shipment: {
      waybillNumber: "WB-334918204",
      carrier: "DHL Express India",
      carrierTrackingUrl: "https://dhl.com/track?wb=WB-334918204",
      origin: {
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        hub: "AMD Air Cargo Complex"
      },
      destination: {
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        hub: "DEL Cargo Transit Terminal 3"
      },
      shipmentStatus: "Customs / Regulatory Hold",
      currentLocation: "Delhi Cargo Terminal 3",
      latestTrackingUpdate: "2026-10-28T14:00:00Z", // Stale: > 90 hours ago!
      expectedDeliveryDate: "2026-10-27T17:00:00Z", // Overdue by 5 days!
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-10-24T10:00:00Z",
          location: "Ahmedabad Air Cargo Complex",
          status: "Shipment Received",
          description: "Shipment cleared security scan at origin."
        },
        {
          timestamp: "2026-10-25T01:30:00Z",
          location: "Delhi Cargo Terminal 3",
          status: "Arrived at Destination Airport",
          description: "Flight SG-819 landed at DEL airport cargo apron."
        },
        {
          timestamp: "2026-10-27T11:00:00Z",
          location: "Delhi Cargo Terminal 3",
          status: "Exception - Regulatory Documentation Hold",
          description: "Customs declaration missing Dual-Use Certificate for laser diodes."
        },
        {
          timestamp: "2026-10-28T14:00:00Z",
          location: "Delhi Cargo Terminal 3",
          status: "Awaiting Importer Clearance",
          description: "Notice dispatched to consignee. Clearance pending. No movement for 90+ hours."
        }
      ]
    }
  },

  {
    id: "ord-108",
    customerOrderId: "ORD-2026-1056",
    supplierOrderId: "SUP-88217-BLR",
    orderDate: "2026-10-31T14:00:00Z",
    orderStatus: "Processing",
    totalAmount: "$3,100.00",
    priority: "Medium",
    items: [
      { name: "Embedded Linux Gateway 4G", sku: "GW-LNX-4G", quantity: 10, unitPrice: "$290.00" },
      { name: "Magnetic Mount Antennas", sku: "ANT-MAG-SMA", quantity: 10, unitPrice: "$20.00" }
    ],
    customer: {
      name: "Deepak Chawla",
      company: "SmartGrid Infrastructure Solutions",
      email: "deepak.c@smartgrid-infra.com",
      phone: "+91 98450 78210",
      shippingAddress: {
        street: "Banjara Hills Road No. 12",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500034",
        country: "India"
      }
    },
    supplier: {
      name: "Apex IoT Hardware Ltd.",
      contactPerson: "Naveen Reddy",
      email: "logistics@apexiot.in",
      phone: "+91 80 4123 9900",
      warehouse: "Whitefield Export Zone, Bengaluru",
      supplierSku: "AIOT-GW-4G"
    },
    shipment: {
      waybillNumber: "WB-PENDING-PICKUP",
      carrier: "BlueDart Apex Express",
      carrierTrackingUrl: null,
      origin: {
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        hub: "Whitefield Hub"
      },
      destination: {
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        hub: "Banjara Hills Depot"
      },
      shipmentStatus: "Processing - Staged for Carrier Pickup",
      currentLocation: "Bengaluru Fulfillment Center",
      latestTrackingUpdate: "2026-11-01T10:00:00Z",
      expectedDeliveryDate: "2026-11-04T18:00:00Z",
      dataSource: "TinyFish Playground Extracted Payload (Demo Data)",
      isDemoData: true,
      shipmentHistory: [
        {
          timestamp: "2026-11-01T09:30:00Z",
          location: "Bengaluru Fulfillment Center",
          status: "Packing Completed",
          description: "Goods packaged into tamper-evident cartons. Carrier airway bill generated."
        }
      ]
    }
  }
];

