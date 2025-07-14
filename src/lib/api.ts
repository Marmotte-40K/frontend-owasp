import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenUtils } from './cookieUtils';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/v1',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: allows cookies to be sent with requests
});

// Request interceptor - no need to manually add Authorization header
// HTTP-only cookies are automatically sent with requests when withCredentials: true
api.interceptors.request.use(
  (config) => {
    // HTTP-only cookies are automatically included with requests
    // No need to manually read and set Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Import authService here to avoid circular dependency
        const { authService } = await import('../services/authService');
        
        // Try to refresh the token
        await authService.refreshToken();
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to login again
        console.error('Token refresh failed:', refreshError);
        tokenUtils.clearAuthTokens();
        
        // Redirect to login page or trigger logout in AuthContext
        // The AuthContext will handle this by checking authentication status
        return Promise.reject(error);
      }
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Common API methods
export const apiMethods = {
  // GET request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
  
  // POST request
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
  
  // PUT request
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
  
  // DELETE request
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
  
  // PATCH request
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.patch<T>(url, data, config),
};
