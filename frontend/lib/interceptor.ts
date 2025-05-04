import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Interface for the token refresh response
 */
interface TokenRefreshResponse {
  token: string;
  refreshToken?: string;
}

/**
 * Interface for API error responses
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
  detail?: string;
}

/**
 * Handle token refresh by calling the refresh endpoint
 * @param token - Current auth token that needs refreshing
 * @returns Promise with the new token
 */
const handleTokenRefresh = async (token: string): Promise<string> => {
  try {
    const response = await axios.post<TokenRefreshResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/refreshToken`,
      { token }
    );

    const newToken = response.data.token;

    if (newToken) {
      // Store both in authToken for the current standard and token for backward compatibility
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    }

    throw new Error('No token received from refresh endpoint');
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh authentication token');
  }
};

/**
 * Check if an error is related to authentication
 * @param error - Axios error object to check
 * @returns boolean indicating if it's an auth error
 */
const isAuthError = (error: AxiosError<ApiErrorResponse>): boolean => {
  return !!(
    error.response?.status === 401 ||
    error.response?.data?.message === 'Token expired' ||
    error.response?.data?.error === 'unauthorized_http_exception' ||
    error.response?.data?.detail?.includes('JWT expired')
  );
};

/**
 * Logger utility to track request/response flow
 * Can be disabled in production via env variable
 */
const logger = {
  request: (config: AxiosRequestConfig): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
  },
  response: (response: AxiosResponse): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }
  },
  error: (error: AxiosError): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `❌ Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`,
        error.response?.data
      );
    }
  },
};

/**
 * Request interceptor to add auth token and required headers
 */
const requestInterceptor = (config: AxiosRequestConfig): AxiosRequestConfig => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    // Add Authorization header if token exists
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    logger.request(config);

    return config;
  } catch (err) {
    console.error('Error in request interceptor:', err);
    return config;
  }
};

/**
 * Success response interceptor - simply passes through the response
 */
const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  logger.response(response);
  return response;
};

/**
 * Error response interceptor - handles token refresh and retries
 */
const responseErrorInterceptor = async (
  error: AxiosError<ApiErrorResponse>
): Promise<AxiosResponse> => {
  logger.error(error);

  // Get the original request config
  const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

  // Prevent infinite refresh loops
  if (originalRequest._retry) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    return Promise.reject(error);
  }

  // Handle authentication errors
  if (isAuthError(error) && originalRequest) {
    originalRequest._retry = true;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      if (!token) {
        throw new Error('No auth token found');
      }

      // Refresh the token
      const newToken = await handleTokenRefresh(token);

      // Update the request with the new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Retry the original request with the new token
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');

      // Redirect to login if configured
      if (
        typeof window !== 'undefined' &&
        process.env.NEXT_PUBLIC_AUTO_REDIRECT_TO_LOGIN === 'true'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

/**
 * Create a configured axios instance for backend API
 */
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    response => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Export configured instances for different endpoints
 */
export const axiosInterceptorInstance = createAxiosInstance(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
);
export const axiosInterceptorInstance2 = createAxiosInstance(
  process.env.NEXT_PUBLIC_FRONT_END_URL || 'http://localhost:3005'
);

/**
 * Create a client-side only axios instance
 * This ensures the interceptors only run in browser environments
 */
export const createClientAxios = (): AxiosInstance => {
  // Only run in browser
  if (typeof window === 'undefined') {
    return axios.create();
  }

  return createAxiosInstance(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004');
};

// Update the default export to use the environment variable with type check
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

export default createAxiosInstance(process.env.NEXT_PUBLIC_API_URL);
