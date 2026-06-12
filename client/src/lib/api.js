const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('queue-cure-token');
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const api = {
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  getCurrentQueue: () => request('/api/queue/current'),
  getWaitingQueue: () => request('/api/queue/waiting'),
  getAnalytics: () => request('/api/queue/analytics'),
  getSettings: () => request('/api/settings'),
  updateAverageTime: (averageConsultationTime) =>
    request('/api/settings/average-time', {
      method: 'PATCH',
      body: { averageConsultationTime }
    }),
  getPatients: () => request('/api/patients'),
  getPatientByToken: (token) => request(`/api/patients/${token}`),
  createPatient: (payload) => request('/api/patients', { method: 'POST', body: payload }),
  updatePatientStatus: (id, status) =>
    request(`/api/patients/${id}/status`, {
      method: 'PATCH',
      body: { status }
    }),
  updatePatient: (id, payload) => request(`/api/patients/${id}`, { method: 'PATCH', body: payload }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),
  callNext: () => request('/api/queue/call-next', { method: 'POST' }),
  startConsultation: (id) => request(`/api/doctor/start/${id}`, { method: 'POST' }),
  endConsultation: (id) => request(`/api/doctor/end/${id}`, { method: 'POST' })
};

export { API_URL };
export default api;