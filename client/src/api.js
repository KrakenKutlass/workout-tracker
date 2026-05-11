const BASE_URL = '/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Workout API
export const workoutsApi = {
  getToday: () => request('/workouts/today'),
  getProgress: () => request('/workouts/progress'),
  getByDate: (date) => request(`/workouts/${date}`),
  logWorkout: (data) => request('/workouts/log', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleExercise: (date, exerciseId, completed) => request(`/workouts/log/${date}/exercise`, {
    method: 'PATCH',
    body: JSON.stringify({ exerciseId, completed }),
  }),
  completeWorkout: (date, stats) => request('/workouts/complete/' + date, {
    method: 'POST',
    body: JSON.stringify(stats),
  }),
};

// Users API
export const usersApi = {
  getMe: () => request('/users/me'),
  updateMe: (data) => request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  resetProgram: () => request('/users/reset', { method: 'POST' }),
};

// Notifications API
export const notificationsApi = {
  getLogs: (limit = 20) => request(`/notifications/logs?limit=${limit}`),
  getConfigStatus: () => request('/notifications/config-status'),
  sendTest: (type = 'both') => request('/notifications/test', {
    method: 'POST',
    body: JSON.stringify({ type }),
  }),
  triggerCheck: () => request('/notifications/trigger', { method: 'POST' }),
  sendReminder: () => request('/notifications/reminder', { method: 'POST' }),
};

// Health check
export const healthApi = {
  check: () => request('/health'),
};

export default {
  workouts: workoutsApi,
  users: usersApi,
  notifications: notificationsApi,
  health: healthApi,
};
