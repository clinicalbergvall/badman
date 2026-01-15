import { API_BASE_URL, getApiUrl } from './config';
import { logger } from './logger';
import { USER_SESSION_KEY, saveUserSession, clearUserSession } from './storage';
import { safeLogError, getUserFriendlyError, sanitizeErrorMessage } from './errorHandler';

// Function to get CapacitorHttp dynamically
const getCapacitorHttp = async (): Promise<any | null> => {
  // Capacitor HTTP plugin is no longer used, always return null
  return null;
};

const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  };
};

const addCorsHeaders = (headers: HeadersInit = {}): HeadersInit => {
  // Check if we're running in a Capacitor environment
  const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
  
  // Add common CORS-related headers
  return {
    ...headers,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Type': 'frontend-app',
    'X-Capacitor': isNative ? 'true' : 'false', // Explicitly indicate if request is from Capacitor
  } as HeadersInit;
};

export const api = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
      if (import.meta.env.DEV) {
        console.log(`API GET Request to: ${url}`);
      }
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    // Always use fetch API for all environments
    try {
      const response = await fetch(url, {
        ...options,
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: 'include', // Always include credentials for all endpoints
        mode: 'cors', // Explicitly set CORS mode
      });
      if (import.meta.env.DEV) {
        console.log(`API GET Response from: ${url}`, response.status, response.statusText);
      }
      if (response.status === 401) {
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.clone().json();
            
            if (errorData.message && !errorData.message.includes('connection') && 
                !errorData.message.includes('timeout') && 
                !errorData.message.includes('network') &&
                !errorData.message.includes('fetch')) {
              localStorage.removeItem(USER_SESSION_KEY);
            }
          } catch (e) {
            
            localStorage.removeItem(USER_SESSION_KEY);
          }
        } else {
          
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        safeLogError(`API PUT:HTML response for ${endpoint}`, new Error('HTML response received'));
        const htmlResponse = await response.text();
        if (import.meta.env.DEV) {
          console.error('HTML Response preview:', htmlResponse.substring(0, 200));
        }
        throw new Error(`API call returned unexpected response format.`);
      }
      
      return response;
    } catch (error) {
      safeLogError(`API GET:${endpoint}`, error);
      
      // Check if this is a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(getUserFriendlyError(new Error('Network connection failed')));
      }
      
      throw new Error(getUserFriendlyError(error));
    }
  },
  post: async (endpoint: string, data: Record<string, any>, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
      if (import.meta.env.DEV) {
        console.log(`API POST Request to: ${url}`);
      }
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    // Always use fetch API for all environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: 'include', // Always include credentials for all endpoints
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(data),
      });
      if (import.meta.env.DEV) {
        console.log(`API POST Response from: ${url}`, response.status, response.statusText);
      }
      if (response.status === 401) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.clone().json();
            
            if (errorData.message && !errorData.message.includes('connection') && 
                !errorData.message.includes('timeout') && 
                !errorData.message.includes('network') &&
                !errorData.message.includes('fetch')) {
              localStorage.removeItem(USER_SESSION_KEY);
            }
          } catch (e) {
            
            localStorage.removeItem(USER_SESSION_KEY);
          }
        } else {
          
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        safeLogError(`API PUT:HTML response for ${endpoint}`, new Error('HTML response received'));
        const htmlResponse = await response.text();
        if (import.meta.env.DEV) {
          console.error('HTML Response preview:', htmlResponse.substring(0, 200));
        }
        throw new Error(`API call returned unexpected response format.`);
      }
      
      // Check if response is not OK and extract error message
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          // Read response as text first (so we can try parsing as JSON later if needed)
          const responseText = await response.text();
          
          if (responseText) {
            // Try to parse as JSON
            try {
              const errorData = JSON.parse(responseText);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMessage = errorData.errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
              } else if (errorData.error) {
                errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
              } else {
                errorMessage = responseText.substring(0, 200);
              }
            } catch {
              // Not JSON, use text as error message
              errorMessage = responseText.substring(0, 200);
            }
          }
        } catch (parseError) {
          // If reading fails, use the default status message
          console.error('Error reading error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      // If we get here, response.ok is true, so we can return it for the caller to parse
      return response;
    } catch (error) {
      safeLogError(`API POST:${endpoint}`, error);
      
      // If it's already a sanitized error, throw as-is
      if (error instanceof Error && error.message && !error.message.includes('Failed to submit')) {
        throw error;
      }
      
      throw new Error(getUserFriendlyError(error));
    }
  },
  put: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    // Always use fetch API for all environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'PUT',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: 'include', // Always include credentials for all endpoints
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(data),
      });
      if (response.status === 401) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.clone().json();
            
            if (errorData.message && !errorData.message.includes('connection') && 
                !errorData.message.includes('timeout') && 
                !errorData.message.includes('network') &&
                !errorData.message.includes('fetch')) {
              localStorage.removeItem(USER_SESSION_KEY);
            }
          } catch (e) {
            
            localStorage.removeItem(USER_SESSION_KEY);
          }
        } else {
          
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        safeLogError(`API PUT:HTML response for ${endpoint}`, new Error('HTML response received'));
        const htmlResponse = await response.text();
        if (import.meta.env.DEV) {
          console.error('HTML Response preview:', htmlResponse.substring(0, 200));
        }
        throw new Error(`API call returned unexpected response format.`);
      }
      
      return response;
    } catch (error) {
      safeLogError(`API PUT:${endpoint}`, error);
      
      throw new Error(getUserFriendlyError(error));
    }
  },
  delete: async (endpoint: string, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    // Always use fetch API for all environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'DELETE',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: 'include', // Always include credentials for all endpoints
        mode: 'cors', // Explicitly set CORS mode
      });
      if (response.status === 401) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.clone().json();
            
            if (errorData.message && !errorData.message.includes('connection') && 
                !errorData.message.includes('timeout') && 
                !errorData.message.includes('network') &&
                !errorData.message.includes('fetch')) {
              localStorage.removeItem(USER_SESSION_KEY);
            }
          } catch (e) {
            
            localStorage.removeItem(USER_SESSION_KEY);
          }
        } else {
          
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        safeLogError(`API DELETE:HTML response for ${endpoint}`, new Error('HTML response received'));
        const htmlResponse = await response.text();
        if (import.meta.env.DEV) {
          console.error('HTML Response preview:', htmlResponse.substring(0, 200));
        }
        throw new Error(`API call returned unexpected response format.`);
      }
      
      return response;
    } catch (error) {
      safeLogError(`API DELETE:${endpoint}`, error);
      
      throw new Error(getUserFriendlyError(error));
    }
  },
};

export const authAPI = {
  login: async (identifier: string, password: string): Promise<any> => {
    try {
      if (import.meta.env.DEV) {
        console.log('Making login request to /auth/login');
      }
      const response = await api.post('/auth/login', { identifier, password });
      
      // If we get here, response.ok is true (api.post throws if not OK)
      if (import.meta.env.DEV) {
        console.log('Response status:', response.status);
      }
      
      // Check if response is not JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        safeLogError('API:login:non-JSON response', new Error('Non-JSON response received'));
        if (import.meta.env.DEV) {
          console.error('Response preview:', textResponse.substring(0, 200));
        }
        throw new Error(`Unexpected response format. Please try again.`);
      }
      
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('Login successful');
      }

      if (data.success && data.user) {
        const hydrated = {
          ...data.user,
          userType: data.user.userType || data.user.role,
          name: data.user.name || "",
          phone: data.user.phone || "",
          lastSignedIn: new Date().toISOString(),
        };
        saveUserSession(hydrated);
      }

      return data;
    } catch (error) {
      safeLogError('API:login', error);
      logger.error('API Error /auth/login', error instanceof Error ? error : undefined);
      // Re-throw with sanitized message
      throw new Error(getUserFriendlyError(error));
    }
  },

  register: async (userData: any) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Making register request to /auth/register');
      }
      const response = await api.post('/auth/register', userData);
      
      // If we get here, response.ok is true (api.post throws if not OK)
      if (import.meta.env.DEV) {
        console.log('Register response status:', response.status);
      }
      
      // Check if response is not JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        safeLogError('API:register:non-JSON response', new Error('Non-JSON response received'));
        if (import.meta.env.DEV) {
          console.error('Response preview:', textResponse.substring(0, 200));
        }
        throw new Error(`Unexpected response format. Please try again.`);
      }
      
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('Registration successful');
      }

      if (data.success && data.user) {
        const hydrated = {
          ...data.user,
          userType: data.user.userType || data.user.role,
          name: data.user.name || "",
          phone: data.user.phone || "",
          lastSignedIn: new Date().toISOString(),
        };
        saveUserSession(hydrated);
      }

      return data;
    } catch (error) {
      safeLogError('API:register', error);
      logger.error('API Error /auth/register', error instanceof Error ? error : undefined);
      // Re-throw with sanitized message
      throw new Error(getUserFriendlyError(error));
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('API Error /auth/profile', error instanceof Error ? error : undefined);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
      clearUserSession();
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout error', error instanceof Error ? error : undefined);
      clearUserSession();
    }
  }
};

export const adminAPI = {
  getPendingCleaners: async () => {
    const response = await api.get('/verification/pending-profiles');
    const data = await response.json();
    return data;
  },

  approveCleaner: async (profileId: string, notes: string) => {
    const response = await api.put(`/verification/approve-profile/${profileId}`, { adminNotes: notes });
    const data = await response.json();
    return data;
  },

  rejectCleaner: async (profileId: string, reason: string, notes: string) => {
    const response = await api.put(`/verification/reject-profile/${profileId}`, { rejectionReason: reason, adminNotes: notes });
    const data = await response.json();
    return data;
  },

  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    const data = await response.json();
    return data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    const data = await response.json();
    return data;
  }
};

export default api;