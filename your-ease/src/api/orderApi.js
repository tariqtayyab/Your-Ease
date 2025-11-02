import { API_BASE, getAuthConfig } from './index';

// Create new order (supports guest orders)
export const createOrder = async (orderData) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthConfig().headers
    },
    body: JSON.stringify(orderData)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create order');
  }
  
  return res.json();
};

// Get user orders (supports guest orders with email)
export const getUserOrders = async (page = 1, limit = 10, email = null) => {
  let url = `${API_BASE}/orders/myorders?page=${page}&limit=${limit}`;
  
  // Add email parameter for guest orders
  if (email) {
    url += `&email=${encodeURIComponent(email)}`;
  }
  
  const res = await fetch(url, getAuthConfig());
  return res.json();
};

// Get order details (supports guest access)
export const getOrderDetails = async (orderId, email = null) => {
  let url = `${API_BASE}/orders/${orderId}`;
  
  // Add email parameter for guest orders
  if (email) {
    url += `?email=${encodeURIComponent(email)}`;
  }
  
  const res = await fetch(url, getAuthConfig());
  return res.json();
};

// In your api.js file
export const getGuestOrder = async (email) => {
  const response = await fetch(`/api/orders/guest?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Order not found');
  }
  return response.json();
};

// Cancel order (supports guest orders)
export const cancelOrder = async (orderId, email = null) => {
  const config = {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      ...getAuthConfig().headers
    }
  };

  // Add email to body for guest orders
  if (email) {
    config.body = JSON.stringify({ email });
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, config);
  return res.json();
};

// Admin: Get filtered orders
export const getFilteredOrders = async (filters = {}) => {
  const { status = 'all', search = '', page = 1, limit = 10 } = filters;
  
  const params = new URLSearchParams({
    status,
    search,
    page: page.toString(),
    limit: limit.toString()
  });
  
  const res = await fetch(
    `${API_BASE}/orders/admin/filtered?${params}`,
    getAuthConfig()
  );
  return res.json();
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthConfig().headers
    },
    body: JSON.stringify(statusData)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update order status');
  }
  
  return res.json();
};