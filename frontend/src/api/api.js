import axios from 'axios';
export const BASE_URL = 'http://localhost:5000';
const API = axios.create({ baseURL: BASE_URL });

const withToken = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Auth
export const registerUser = (data)=>API.post('/api/auth/register', data);
export const loginUser = (data)=>API.post('/api/auth/login', data);

// Tasks
export const getTasks = (params)=>API.get('/api/tasks', { ...withToken(), params });
export const addTask = (data)=>API.post('/api/tasks', data, withToken());
export const toggleTask = (id)=>API.patch(`/api/tasks/${id}`, {}, withToken());
export const deleteTask = (id)=>API.delete(`/api/tasks/${id}`, withToken());

// Mood
export const getMoods = (params)=>API.get('/api/mood', { ...withToken(), params });
export const addMood = (data)=>API.post('/api/mood', data, withToken());
export const deleteMood = (id)=>API.delete(`/api/mood/${id}`, withToken());

// Journal
export const getJournals = (params)=>API.get('/api/journals', { ...withToken(), params });
export const addJournal = (data)=>API.post('/api/journals', data, withToken());
export const getUser = () => API.get('/api/profile', withToken());
export const deleteJournal = (id)=>API.delete(`/api/journals/${id}`, withToken());

// Profile
export const getProfile = () => API.get('/api/profile', withToken());
export const updateProfile = (data) => API.put('/api/profile', data, withToken());
export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return API.post('/api/profile/avatar', form, {
    headers: { ...withToken().headers, 'Content-Type': 'multipart/form-data' }
  });
};

