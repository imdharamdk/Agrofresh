import api from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  myProducts: () => api.get('/products/farmer/my-products'),
  create: (payload) => api.post('/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, payload) => api.put(`/products/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/products/${id}`)
};

export const orderApi = {
  create: (payload) => api.post('/orders', payload),
  createBulk: (payload) => api.post('/orders/bulk', payload),
  myOrders: () => api.get('/orders/my-orders'),
  farmerOrders: () => api.get('/orders/farmer-orders'),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, payload) => api.put(`/orders/${id}/status`, payload)
};

export const negotiationApi = {
  create: (payload) => api.post('/negotiations', payload),
  mine: () => api.get('/negotiations/mine'),
  get: (id) => api.get(`/negotiations/${id}`),
  update: (id, payload) => api.put(`/negotiations/${id}`, payload)
};

export const subscriptionApi = {
  create: (payload) => api.post('/subscriptions', payload),
  mine: () => api.get('/subscriptions/mine')
};

export const reviewApi = {
  create: (payload) => api.post('/reviews', payload),
  getFarmerReviews: (farmerId) => api.get(`/reviews/${farmerId}`)
};

export const deliveryApi = {
  orders: () => api.get('/delivery/orders'),
  assign: (orderId, payload) => api.put(`/delivery/assign/${orderId}`, payload),
  updateStatus: (orderId, payload) => api.put(`/delivery/status/${orderId}`, payload)
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  analytics: () => api.get('/admin/analytics'),
  orders: () => api.get('/admin/orders'),
  verifyFarmer: (id, payload) => api.put(`/admin/users/${id}/verify`, payload)
};
