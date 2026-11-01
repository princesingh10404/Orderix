// API client service for Orderix

const BASE_URL = '/api';

export async function fetchOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.riskLevel) query.append('riskLevel', params.riskLevel);
  if (params.filterType) query.append('filterType', params.filterType);

  const url = `${BASE_URL}/orders${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchOrderById(id) {
  const response = await fetch(`${BASE_URL}/orders/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch order ${id}: ${response.statusText}`);
  }
  return response.json();
}

export async function analyzeCustomPayload(payload) {
  const response = await fetch(`${BASE_URL}/orders/intelligence/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Failed to analyze payload: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTinyFishStatus() {
  const response = await fetch(`${BASE_URL}/orders/tinyfish/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TinyFish status: ${response.statusText}`);
  }
  return response.json();
}

export async function trackLiveWithTinyFish({ waybillNumber, trackingUrl, carrier, orderId } = {}) {
  const response = await fetch(`${BASE_URL}/orders/tinyfish/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      waybillNumber,
      trackingUrl,
      carrier,
      orderId
    })
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = data?.error || data?.message || response.statusText;
    const err = new Error(errorMsg);
    err.extractionStatus = data?.extractionStatus || 'CONNECTION_ERROR';
    err.data = data;
    throw err;
  }
  return data;
}
