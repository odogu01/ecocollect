import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data)
}

// Pickup API
export const pickupAPI = {
  create: (data) => api.post('/pickups', data),
  getAll: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  getMyPickups: () => api.get('/pickups/my-pickups'),
  updateStatus: (id, status) => api.put(`/pickups/${id}/status`, { status }),
  assignDriver: (id, driverId) => api.put(`/pickups/${id}/assign`, { driverId }),
  getStats: () => api.get('/pickups/stats')
}

// User API (Admin)
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  approve: (id) => api.put(`/users/${id}/approve`),
  getDrivers: () => api.get('/users/drivers'),
  getLocations: () => api.get('/users/locations'),
  getByCity: (city, params) => api.get(`/users/by-city/${city}`, { params }),
  getCities: () => api.get('/users/cities'),
  trashCanAlert: (data) => api.post('/users/trashcan-alert', data)
}

// Payment API
export const paymentAPI = {
  createIntent: (pickupId) => api.post(`/payments/create-intent/${pickupId}`),
  confirm: (pickupId, paymentId) => api.post(`/payments/confirm/${pickupId}`, { paymentId }),
  getHistory: () => api.get('/payments/history'),
  getByPickup: (pickupId) => api.get(`/payments/pickup/${pickupId}`)
}

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
}

// Subscription API
export const subscriptionAPI = {
  create: (data) => api.post('/subscriptions/create', data),
  payment: (data) => api.post('/subscriptions/payment', data),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  verify: () => api.get('/subscriptions/verify'),
  getPricing: () => api.get('/subscriptions/pricing'),
  renew: (durationMonths) => api.put('/subscriptions/renew', { durationMonths }),
  cancel: () => api.post('/subscriptions/cancel')
}

// Pricing API (Company/Admin)
export const pricingAPI = {
  get: () => api.get('/pricing'),
  update: (data) => api.put('/pricing', data),
  setDiscountCode: (data) => api.post('/pricing/discount-code', data),
  getHistory: () => api.get('/pricing/history')
}

// Trash Can API
export const trashCanAPI = {
  getDeliveries: () => api.get('/trashcans/deliveries'),
  getAll: (params) => api.get('/trashcans/all', { params }),
  assignDriver: (data) => api.post('/trashcans/assign', data),
  updateStatus: (id, status) => api.put(`/trashcans/${id}/status`, { status }),
  deliver: (id, data) => api.put(`/trashcans/${id}/deliver`, data),
  getMyDeliveries: () => api.get('/trashcans/my-deliveries'),
  autoAssign: () => api.post('/trashcans/auto-assign')
}

export default api