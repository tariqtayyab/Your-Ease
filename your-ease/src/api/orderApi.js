import { API_BASE, getAuthConfig } from './index';

// Get user orders
export const getUserOrders = async (page = 1, limit = 10) => {
  const res = await fetch(
    `${API_BASE}/orders/myorders?page=${page}&limit=${limit}`,
    getAuthConfig()
  );
  return res.json();
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const res = await fetch(
    `${API_BASE}/orders/${orderId}`,
    getAuthConfig()
  );
  return res.json();
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: getAuthConfig().headers
  });
  return res.json();
};