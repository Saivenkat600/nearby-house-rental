import api, { unwrap } from './api';

export const propertyService = {
  async list(params = {}) { return unwrap(await api.get('/properties', { params })); },
  async nearby(params = {}) { return unwrap(await api.get('/properties/nearby', { params })); },
  async get(id) { return unwrap(await api.get(`/properties/${id}`)); },
  async mine() { return unwrap(await api.get('/properties/my')); },
  async create(values) { return unwrap(await api.post('/properties', values)); },
  async update(id, values) { return unwrap(await api.put(`/properties/${id}`, values)); },
  async remove(id) { return unwrap(await api.delete(`/properties/${id}`)); }
};
