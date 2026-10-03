import api, { unwrap } from './api';

export const inquiryService = {
  async create(values) { return unwrap(await api.post('/inquiries', values)); },
  async mine() { return unwrap(await api.get('/inquiries/my')); },
  async owner() { return unwrap(await api.get('/inquiries/owner')); },
  async updateStatus(id, status) { return unwrap(await api.put(`/inquiries/${id}/status`, { status })); }
};
