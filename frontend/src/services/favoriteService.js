import api, { unwrap } from './api';

export const favoriteService = {
  async list() { return unwrap(await api.get('/favorites')); },
  async add(propertyId) { return unwrap(await api.post(`/favorites/${propertyId}`)); },
  async remove(propertyId) { return unwrap(await api.delete(`/favorites/${propertyId}`)); }
};
