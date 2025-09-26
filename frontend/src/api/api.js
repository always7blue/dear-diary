import axios from 'axios';
export const BASE_URL = 'http://localhost:5000';
const API = axios.create({ baseURL: BASE_URL });

const withToken = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Auth
export const registerUser = (data)=>API.post('/auth/register', data);
export const loginUser = (data)=>API.post('/auth/login', data);

// Tasks
export const getTasks = (params)=>API.get('/tasks', { ...withToken(), params });
export const addTask = (data)=>API.post('/tasks', data, withToken());
export const toggleTask = (id)=>API.patch(`/tasks/${id}`, {}, withToken());
export const deleteTask = (id)=>API.delete(`/tasks/${id}`, withToken());

// Mood
export const getMoods = (params)=>API.get('/mood', { ...withToken(), params });
export const addMood = (data)=>API.post('/mood', data, withToken());
export const deleteMood = (id)=>API.delete(`/mood/${id}`, withToken());

// Journal
export const getJournals = (params)=>API.get('/journals', { ...withToken(), params });
export const addJournal = (data)=>API.post('/journals', data, withToken());
export const getUser = () => API.get('/profile', withToken());
export const deleteJournal = (id)=>API.delete(`/journals/${id}`, withToken());

// Profile
export const getProfile = () => API.get('/profile', withToken());
export const updateProfile = (data) => API.put('/profile', data, withToken());
export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return API.post('/profile/avatar', form, {
    headers: { ...withToken().headers, 'Content-Type': 'multipart/form-data' }
  });
};

