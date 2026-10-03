import api, { unwrap } from './api';

export const authService = {
  async register(values) { return unwrap(await api.post('/auth/register', values)); },
  async login(values) { return unwrap(await api.post('/auth/login', values)); },
  async me() { return unwrap(await api.get('/auth/me')); }
};
