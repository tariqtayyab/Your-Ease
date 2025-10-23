import { API_BASE, getAuthConfig } from './index';

// Get addresses
export const getAddresses = async () => {
  const res = await fetch(`${API_BASE}/addresses`, getAuthConfig());
  return res.json();
};

// Add address
export const addAddress = async (addressData) => {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(addressData),
  });
  return res.json();
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  const res = await fetch(`${API_BASE}/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(addressData),
  });
  return res.json();
};

// Delete address
export const deleteAddress = async (addressId) => {
  const res = await fetch(`${API_BASE}/addresses/${addressId}`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};

// Set default address
export const setDefaultAddress = async (addressId) => {
  const res = await fetch(`${API_BASE}/addresses/${addressId}/default`, {
    method: "PATCH",
    headers: getAuthConfig().headers
  });
  return res.json();
};