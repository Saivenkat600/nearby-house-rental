import api, { unwrap } from './api';

export const adminService = {
  async stats() { return unwrap(await api.get('/admin/stats')); },
  async users() { return unwrap(await api.get('/admin/users')); },
  async deleteUser(id) { return unwrap(await api.delete(`/admin/users/${id}`)); },
  async properties() { return unwrap(await api.get('/admin/properties')); },
  async deleteProperty(id) { return unwrap(await api.delete(`/admin/properties/${id}`)); },
  async updateAvailability(id, available) { return unwrap(await api.put(`/admin/properties/${id}`, { available })); }
};
