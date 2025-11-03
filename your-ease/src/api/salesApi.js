import { API_BASE, getAuthHeaders } from './index';

// Get all sales (with pagination and filtering)
export const getSales = async (page = 1, limit = 10, status = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await fetch(`${API_BASE}/sales?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch sales');
    }

    return await response.json();
  } catch (error) {
    console.error('Get sales error:', error);
    throw error;
  }
};

// Get single sale by ID
export const getSaleById = async (saleId) => {
  try {
    const response = await fetch(`${API_BASE}/sales/${saleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Get sale error:', error);
    throw error;
  }
};

// Create new sale
export const createSale = async (saleData) => {
  try {
    const response = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(saleData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Create sale error:', error);
    throw error;
  }
};

// Update sale
export const updateSale = async (saleId, saleData) => {
  try {
    const response = await fetch(`${API_BASE}/sales/${saleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(saleData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Update sale error:', error);
    throw error;
  }
};

// Delete sale
export const deleteSale = async (saleId) => {
  try {
    const response = await fetch(`${API_BASE}/sales/${saleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete sale error:', error);
    throw error;
  }
};

// Get active sales for frontend
export const getActiveSales = async () => {
  try {
    const response = await fetch(`${API_BASE}/sales/active/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch active sales');
    }

    return await response.json();
  } catch (error) {
    console.error('Get active sales error:', error);
    throw error;
  }
};

// Apply sale to products (if you want a separate endpoint for this)
export const applySaleToProducts = async (saleId) => {
  try {
    const response = await fetch(`${API_BASE}/sales/${saleId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to apply sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Apply sale error:', error);
    throw error;
  }
};

// Revert sale from products
export const revertSaleFromProducts = async (saleId) => {
  try {
    const response = await fetch(`${API_BASE}/sales/${saleId}/revert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to revert sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Revert sale error:', error);
    throw error;
  }
};