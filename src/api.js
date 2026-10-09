// CampusCart REST API Client in JavaScript

export const TOKEN_STORAGE_KEY = 'campuscart_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () => apiRequest('/api/auth/me'),

  updateProfile: (payload) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  resetPassword: (email) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  sendTestNotification: () =>
    apiRequest('/api/auth/test-notification', {
      method: 'POST',
    }),

  // Categories
  getCategories: () => apiRequest('/api/categories'),
  createCategory: (payload) =>
    apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCategory: (id, payload) =>
    apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id) =>
    apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    }),

  // Listings
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return apiRequest(`/api/listings?${query.toString()}`);
  },

  getListingById: (id) => apiRequest(`/api/listings/${id}`),

  createListing: (payload) =>
    apiRequest('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateListing: (id, payload) =>
    apiRequest(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteListing: (id) =>
    apiRequest(`/api/listings/${id}`, {
      method: 'DELETE',
    }),

  updateListingStatus: (id, status, reason) =>
    apiRequest(`/api/listings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  // Wishlist
  getWishlist: () => apiRequest('/api/wishlist'),
  addToWishlist: (listingId) =>
    apiRequest('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    }),
  removeFromWishlist: (listingId) =>
    apiRequest(`/api/wishlist/${listingId}`, {
      method: 'DELETE',
    }),

  // Enquiries
  getEnquiries: () => apiRequest('/api/enquiries'),
  createEnquiry: (payload) =>
    apiRequest('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateEnquiryStatus: (id, payload) =>
    apiRequest(`/api/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Reports
  createReport: (payload) =>
    apiRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminReports: () => apiRequest('/api/reports/admin'),
  updateAdminReport: (id, payload) =>
    apiRequest(`/api/reports/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Admin
  getAdminOverview: () => apiRequest('/api/admin/overview'),
  getAdminUsers: () => apiRequest('/api/admin/users'),
  updateUserStatus: (id, payload) =>
    apiRequest(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  resetDemoData: () => apiRequest('/api/admin/reset-demo', { method: 'POST' }),

  // AI features
  generateAiDescription: (payload) =>
    apiRequest('/api/ai/describe', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  suggestAiCategory: (payload) =>
    apiRequest('/api/ai/suggest-category', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkAiQuality: (payload) =>
    apiRequest('/api/ai/quality-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
