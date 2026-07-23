import api from './index';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    api.post('/auth/register', data),

  verifyEmail: (data: { userId: string; code: string }) =>
    api.post('/auth/verify-email', data),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { userId: string; token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),

  refreshToken: () => api.post('/auth/refresh'),

  getMe: () => api.get('/auth/me'),
};
