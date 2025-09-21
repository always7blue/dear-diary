import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

const withToken = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// Mood
export const addMood = (data) => API.post('/mood', data, withToken());
export const getMoods = () => API.get('/mood', withToken());

// Tasks
export const getTasks = () => API.get('/tasks', withToken());
export const addTask = (data) => API.post('/tasks', data, withToken());
export const toggleTask = (id) => API.patch(`/tasks/${id}`, {}, withToken());
export const deleteTask = (id) => API.delete(`/tasks/${id}`, withToken());

// Journal
export const getJournals = () => API.get('/journal', withToken());
export const addJournal = (data) => API.post('/journal', data, withToken());

export default API;
