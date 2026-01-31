import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { LoginResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory token storage (never use localStorage for sensitive tokens)
let accessToken: string | null = null;
let tokenExpirationDate: Date | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Functions to manage token state
export const setTokens = (token: string, expirationDate: string): void => {
  accessToken = token;
  tokenExpirationDate = new Date(expirationDate);
};

export const clearTokens = (): void => {
  accessToken = null;
  tokenExpirationDate = null;
};

export const getAccessToken = (): string | null => accessToken;
export const getTokenExpirationDate = (): Date | null => tokenExpirationDate;

const isTokenExpiringSoon = (): boolean => {
  if (!tokenExpirationDate) return false;
  const now = new Date();
  const timeUntilExpiry = tokenExpirationDate.getTime() - now.getTime();
  return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0;
};

const isTokenExpired = (): boolean => {
  if (!tokenExpirationDate) return true;
  return new Date() >= tokenExpirationDate;
};

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Create the axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and autonomous token refresh
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for login, register endpoints
    const publicPaths = ['/auth/login', '/accounts'];
    const isPublicPath = publicPaths.some((path) => config.url?.includes(path));
    
    if (isPublicPath && config.method?.toLowerCase() === 'post') {
      return config;
    }

    // Check if token needs refresh before making the request
    if (accessToken && isTokenExpiringSoon() && !isRefreshing) {
      isRefreshing = true;
      
      try {
        const response = await axios.post<LoginResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        setTokens(response.data.token, response.data.expirationDate);
        onRefreshed(response.data.token);
      } catch (error) {
        clearTokens();
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw error;
      } finally {
        isRefreshing = false;
      }
    } else if (isRefreshing) {
      // Wait for token refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(config);
        });
      });
    }

    // Add authorization header if token exists
    if (accessToken && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - token might be expired or revoked
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (accessToken && !isTokenExpired()) {
        // Try to refresh the token
        try {
          const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          setTokens(response.data.token, response.data.expirationDate);
          
          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
