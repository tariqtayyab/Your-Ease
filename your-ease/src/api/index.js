const API_BASE = "http://localhost:5000/api";

export function getAuthHeaders() {
  const raw = localStorage.getItem("userInfo");
  const parsed = raw ? JSON.parse(raw) : null;
  const token = parsed?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAuthConfig() {
  return {
    headers: getAuthHeaders()
  };
}

export { API_BASE };

// Export all API modules
export * from './authApi';
export * from './userApi';
export * from './orderApi';
export * from './wishlistApi';
export * from './addressApi';
export * from './paymentApi';
export * from './reviewApi';