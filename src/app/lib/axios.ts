import axios from 'axios';

const api = axios.create();

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Ensure headers object exists
      config.headers = config.headers || {};
      // Add content type for JSON
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored data
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Force reload to login page
      window.location.replace('/');
    }
    return Promise.reject(error);
  }
);

export default api;
