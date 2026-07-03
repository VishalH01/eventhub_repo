// Axios is a popular promise-based HTTP client for the browser and Node.js.
// It allows us to make HTTP requests (GET, POST, PUT, DELETE) to our backend API easily.
import axios from 'axios';

// Create a custom instance of Axios with default configurations.
const API = axios.create({
  // The base URL for all HTTP requests we make using this instance.
  // Our Spring Boot backend runs on localhost:8080 by default.
  // We suffix it with '/api' so all requests map to our backend API endpoints.
  baseURL: 'http://localhost:8080/api',
  // Sets the default headers for JSON payload requests.
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor:
// Interceptors are functions that Axios calls automatically before a request is sent to the server.
// We use this to check if a JWT token is saved in the browser's localStorage.
// If it exists, we attach it to the 'Authorization' header as a Bearer Token.
// This allows the backend Spring Security to verify who we are on protected routes.
API.interceptors.request.use(
  (config) => {
    // Retrieve the token saved under the key 'token' in local storage
    const token = localStorage.getItem('token');
    
    // If the token exists, attach it to the headers
    if (token) {
      // The standard format for JWT authorization headers is: Bearer <JWT_token>
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Always return the configuration object so Axios can proceed with the request
    return config;
  },
  (error) => {
    // If there is an error during request setup, reject the promise with the error
    return Promise.reject(error);
  }
);

export default API;
