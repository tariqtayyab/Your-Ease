import { API_BASE, getAuthConfig } from './index';

// Get user profile
export const getUserProfile = async () => {
  const res = await fetch(`${API_BASE}/users/profile`, getAuthConfig());
  return res.json();
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(userData),
  });
  return res.json();
};

// Update user preferences
export const updateUserPreferences = async (preferences) => {
  const res = await fetch(`${API_BASE}/users/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify(preferences),
  });
  return res.json();
};

// Get user dashboard data
export const getUserDashboard = async () => {
  const res = await fetch(`${API_BASE}/users/dashboard`, getAuthConfig());
  return res.json();
};