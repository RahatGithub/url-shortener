import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// creating axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// auth API calls
export const authAPI = {
    register: (email, password) => api.post('/auth/register', { email, password }),
    login: (email, password) => api.post('/auth/login', { email, password }),
    getMe: () => api.get('/auth/me')
};

// URL API calls
export const urlAPI = {
    create: (originalUrl) => api.post('/urls', { originalUrl }),
    getAll: () => api.get('/urls'),
    delete: (id) => api.delete(`/urls/${id}`),
    getStats: (id) => api.get(`/urls/${id}`)
};

export default api;