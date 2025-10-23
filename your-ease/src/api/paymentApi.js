import { API_BASE, getAuthConfig } from './index';

// Get payment methods
export const getPaymentMethods = async () => {
  const res = await fetch(`${API_BASE}/payments`, getAuthConfig());
  return res.json();
};

// Add payment method
export const addPaymentMethod = async (paymentData) => {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(paymentData),
  });
  return res.json();
};

// Update payment method
export const updatePaymentMethod = async (paymentId, paymentData) => {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(paymentData),
  });
  return res.json();
};

// Delete payment method
export const deletePaymentMethod = async (paymentId) => {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};

// Set default payment method
export const setDefaultPayment = async (paymentId) => {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/default`, {
    method: "PATCH",
    headers: getAuthConfig().headers
  });
  return res.json();
};