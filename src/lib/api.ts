import { API_BASE_URL, getApiUrl } from './config';
import { logger } from './logger';
import { USER_SESSION_KEY } from './storage';

// Type declaration for Capacitor HTTP
interface CapacitorHttp {
  request: (options: any) => Promise<any>;
}

// Function to get CapacitorHttp dynamically
const getCapacitorHttp = async (): Promise<CapacitorHttpPlugin | null> => {
  try {
    const capacitorHttpModule = await import('@capacitor/http');
    console.log('CapacitorHttp imported successfully');
    return capacitorHttpModule.Http;
  } catch (error) {
    console.warn('Capacitor HTTP plugin not available:', error);
    return null;
  }
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
    console.log(`API GET Request to: ${url}`);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    if (isNative) {
      // Use CapacitorHttp for native mobile environments
      try {
        const CapacitorHttp = await getCapacitorHttp();
        if (CapacitorHttp) {
          console.log('Using CapacitorHttp for GET request');
          
          const response = await CapacitorHttp.request({
            url: url,
            method: 'GET',
            headers: addCorsHeaders({
              ...getAuthHeaders(),
              ...options.headers,
            }),
            // CapacitorHttp doesn't use credentials, so we don't need to worry about that
          });
          
          const statusCode = typeof response.status === 'object' && 'code' in response.status ? response.status.code : response.status as number;
          const statusText = typeof response.status === 'object' && 'text' in response.status ? response.status.text : 'OK';
          
          console.log(`CapacitorHttp GET Response from: ${url}`, statusCode);
          
          // Convert Capacitor response to fetch-like response
          const fetchLikeResponse = {
            ok: statusCode >= 200 && statusCode < 300,
            status: statusCode || 200,
            statusText: statusText || 'OK',
            json: () => Promise.resolve(response.data),
            text: () => Promise.resolve(JSON.stringify(response.data)),
            blob: () => Promise.reject(new Error('Blob not supported in CapacitorHttp')),
            arrayBuffer: () => Promise.reject(new Error('ArrayBuffer not supported in CapacitorHttp')),
            formData: () => Promise.reject(new Error('FormData not supported in CapacitorHttp')),
            headers: {
              get: (name: string) => response.headers?.[name] || null,
            } as any,
            url: url,
          } as Response;
          
          if (fetchLikeResponse.status === 401) {
            localStorage.removeItem(USER_SESSION_KEY);
          }
          
          // Check if the response is HTML instead of JSON for API calls
          const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
          if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
              contentType && 
              contentType.toLowerCase().includes('text/html')) {
            console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
            const htmlResponse = JSON.stringify(response.data);
            console.error('HTML Response preview:', htmlResponse.substring(0, 500));
            throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
          }
          
          return fetchLikeResponse;
        }
      } catch (capacitorError) {
        console.warn('CapacitorHttp GET request failed, falling back to fetch:', capacitorError);
      }
    }
    
    // Fallback to regular fetch for web environments
    try {
      const response = await fetch(url, {
        ...options,
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: isNative ? 'omit' : 'include', // Use 'omit' for Capacitor to avoid credential issues
        mode: 'cors', // Explicitly set CORS mode
      });
      console.log(`API GET Response from: ${url}`, response.status, response.statusText);
      if (response.status === 401) {
        
        localStorage.removeItem(USER_SESSION_KEY);
        
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
        const htmlResponse = await response.text();
        console.error('HTML Response preview:', htmlResponse.substring(0, 500));
        throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
      }
      
      return response;
    } catch (error) {
      console.error(`API GET Request failed to: ${url}`, error);
      
      // Check if this is a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - server may be down or unreachable');
        throw new Error(`Network error: Could not reach the server at ${url}. Make sure the backend is running.`);
      }
      
      throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },
  post: async (endpoint: string, data: Record<string, any>, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
    console.log(`API POST Request to: ${url}`, data);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    if (isNative) {
      // Use CapacitorHttp for native mobile environments
      try {
        const CapacitorHttp = await getCapacitorHttp();
        if (CapacitorHttp) {
          console.log('Using CapacitorHttp for POST request');
          
          const response = await CapacitorHttp.request({
            url: url,
            method: 'POST',
            headers: addCorsHeaders({
              ...getAuthHeaders(),
              ...options.headers,
            }),
            data: data, // CapacitorHttp uses 'data' instead of 'body'
          });
          
          const postStatusCode = typeof response.status === 'object' && 'code' in response.status ? response.status.code : response.status as number;
          const postStatusText = typeof response.status === 'object' && 'text' in response.status ? response.status.text : 'OK';
          
          console.log(`CapacitorHttp POST Response from: ${url}`, postStatusCode);
          
          // Convert Capacitor response to fetch-like response
          const fetchLikeResponse = {
            ok: postStatusCode >= 200 && postStatusCode < 300,
            status: postStatusCode || 200,
            statusText: postStatusText || 'OK',
            json: () => Promise.resolve(response.data),
            text: () => Promise.resolve(JSON.stringify(response.data)),
            blob: () => Promise.reject(new Error('Blob not supported in CapacitorHttp')),
            arrayBuffer: () => Promise.reject(new Error('ArrayBuffer not supported in CapacitorHttp')),
            formData: () => Promise.reject(new Error('FormData not supported in CapacitorHttp')),
            headers: {
              get: (name: string) => response.headers?.[name] || null,
            } as any,
            url: url,
          } as Response;
          
          if (fetchLikeResponse.status === 401) {
            localStorage.removeItem(USER_SESSION_KEY);
          }
          
          // Check if the response is HTML instead of JSON for API calls
          const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
          if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
              contentType && 
              contentType.toLowerCase().includes('text/html')) {
            console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
            const htmlResponse = JSON.stringify(response.data);
            console.error('HTML Response preview:', htmlResponse.substring(0, 500));
            throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
          }
          
          // Check if response is not OK and extract error message
          if (!fetchLikeResponse.ok) {
            let errorMessage = `Request failed with status ${fetchLikeResponse.status}`;
            try {
              // Use the response data from CapacitorHttp
              const errorData = response.data;
              
              if (errorData && typeof errorData === 'object') {
                if (errorData.message) {
                  errorMessage = errorData.message;
                } else if (errorData.errors && Array.isArray(errorData.errors)) {
                  errorMessage = errorData.errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
                } else if (errorData.error) {
                  errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
                } else {
                  errorMessage = JSON.stringify(errorData).substring(0, 200);
                }
              }
            } catch (parseError) {
              // If reading fails, use the default status message
              console.error('Error reading error response:', parseError);
            }
            throw new Error(errorMessage);
          }
          
          // If we get here, response.ok is true, so we can return it for the caller to parse
          return fetchLikeResponse;
        }
      } catch (capacitorError) {
        console.warn('CapacitorHttp POST request failed, falling back to fetch:', capacitorError);
      }
    }
    
    // Fallback to regular fetch for web environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: isNative ? 'omit' : 'include', // Use 'omit' for Capacitor to avoid credential issues
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(data),
      });
      console.log(`API POST Response from: ${url}`, response.status, response.statusText);
      if (response.status === 401) {
        localStorage.removeItem(USER_SESSION_KEY);
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
        const htmlResponse = await response.text();
        console.error('HTML Response preview:', htmlResponse.substring(0, 500));
        throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
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
      console.error(`API POST Request failed to: ${url}`, error);
      
      // If it's already an Error with a message, throw it as-is
      if (error instanceof Error && error.message && !error.message.startsWith('Failed to submit data')) {
        throw error;
      }
      
      throw new Error(`Failed to submit data: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },
  put: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    if (isNative) {
      // Use CapacitorHttp for native mobile environments
      try {
        const CapacitorHttp = await getCapacitorHttp();
        if (CapacitorHttp) {
          console.log('Using CapacitorHttp for PUT request');
          
          const response = await CapacitorHttp.request({
            url: url,
            method: 'PUT',
            headers: addCorsHeaders({
              ...getAuthHeaders(),
              ...options.headers,
            }),
            data: data, // CapacitorHttp uses 'data' instead of 'body'
          });
          
          const putStatusCode = typeof response.status === 'object' && 'code' in response.status ? response.status.code : response.status as number;
          const putStatusText = typeof response.status === 'object' && 'text' in response.status ? response.status.text : 'OK';
          
          console.log(`CapacitorHttp PUT Response from: ${url}`, putStatusCode);
          
          // Convert Capacitor response to fetch-like response
          const fetchLikeResponse = {
            ok: putStatusCode >= 200 && putStatusCode < 300,
            status: putStatusCode || 200,
            statusText: putStatusText || 'OK',
            json: () => Promise.resolve(response.data),
            text: () => Promise.resolve(JSON.stringify(response.data)),
            blob: () => Promise.reject(new Error('Blob not supported in CapacitorHttp')),
            arrayBuffer: () => Promise.reject(new Error('ArrayBuffer not supported in CapacitorHttp')),
            formData: () => Promise.reject(new Error('FormData not supported in CapacitorHttp')),
            headers: {
              get: (name: string) => response.headers?.[name] || null,
            } as any,
            url: url,
          } as Response;
          
          if (fetchLikeResponse.status === 401) {
            localStorage.removeItem(USER_SESSION_KEY);
          }
          
          // Check if the response is HTML instead of JSON for API calls
          const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
          if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
              contentType && 
              contentType.toLowerCase().includes('text/html')) {
            console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
            const htmlResponse = JSON.stringify(response.data);
            console.error('HTML Response preview:', htmlResponse.substring(0, 500));
            throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
          }
          
          return fetchLikeResponse;
        }
      } catch (capacitorError) {
        console.warn('CapacitorHttp PUT request failed, falling back to fetch:', capacitorError);
      }
    }
    
    // Fallback to regular fetch for web environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'PUT',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: isNative ? 'omit' : 'include', // Use 'omit' for Capacitor to avoid credential issues
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(data),
      });
      if (response.status === 401) {
        localStorage.removeItem(USER_SESSION_KEY);
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
        const htmlResponse = await response.text();
        console.error('HTML Response preview:', htmlResponse.substring(0, 500));
        throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
      }
      
      return response;
    } catch (error) {
      console.error(`API PUT Request failed to: ${url}`, error);
      
      throw new Error(`Failed to update data: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },
  delete: async (endpoint: string, options: RequestInit = {}) => {
    const url = getApiUrl(endpoint);
    
    // Check if we're running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
    
    if (isNative) {
      // Use CapacitorHttp for native mobile environments
      try {
        const CapacitorHttp = await getCapacitorHttp();
        if (CapacitorHttp) {
          console.log('Using CapacitorHttp for DELETE request');
          
          const response = await CapacitorHttp.request({
            url: url,
            method: 'DELETE',
            headers: addCorsHeaders({
              ...getAuthHeaders(),
              ...options.headers,
            }),
          });
          
          const deleteStatusCode = typeof response.status === 'object' && 'code' in response.status ? response.status.code : response.status as number;
          const deleteStatusText = typeof response.status === 'object' && 'text' in response.status ? response.status.text : 'OK';
          
          console.log(`CapacitorHttp DELETE Response from: ${url}`, deleteStatusCode);
          
          // Convert Capacitor response to fetch-like response
          const fetchLikeResponse = {
            ok: deleteStatusCode >= 200 && deleteStatusCode < 300,
            status: deleteStatusCode || 200,
            statusText: deleteStatusText || 'OK',
            json: () => Promise.resolve(response.data),
            text: () => Promise.resolve(JSON.stringify(response.data)),
            blob: () => Promise.reject(new Error('Blob not supported in CapacitorHttp')),
            arrayBuffer: () => Promise.reject(new Error('ArrayBuffer not supported in CapacitorHttp')),
            formData: () => Promise.reject(new Error('FormData not supported in CapacitorHttp')),
            headers: {
              get: (name: string) => response.headers?.[name] || null,
            } as any,
            url: url,
          } as Response;
          
          if (fetchLikeResponse.status === 401) {
            localStorage.removeItem(USER_SESSION_KEY);
          }
          
          // Check if the response is HTML instead of JSON for API calls
          const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
          if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
              contentType && 
              contentType.toLowerCase().includes('text/html')) {
            console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
            const htmlResponse = JSON.stringify(response.data);
            console.error('HTML Response preview:', htmlResponse.substring(0, 500));
            throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
          }
          
          return fetchLikeResponse;
        }
      } catch (capacitorError) {
        console.warn('CapacitorHttp DELETE request failed, falling back to fetch:', capacitorError);
      }
    }
    
    // Fallback to regular fetch for web environments
    try {
      const response = await fetch(url, {
        ...options,
        method: 'DELETE',
        headers: addCorsHeaders({
          ...getAuthHeaders(),
          ...options.headers,
        }),
        credentials: isNative ? 'omit' : 'include', // Use 'omit' for Capacitor to avoid credential issues
        mode: 'cors', // Explicitly set CORS mode
      });
      if (response.status === 401) {
        localStorage.removeItem(USER_SESSION_KEY);
      }
      
      // Check if the response is HTML instead of JSON for API calls
      const contentType = response.headers.get('content-type');
      if ((endpoint.includes('/auth/') || endpoint.includes('/api/')) && 
          contentType && 
          contentType.toLowerCase().includes('text/html')) {
        console.error(`HTML response received for API endpoint ${endpoint} at ${url}`);
        const htmlResponse = await response.text();
        console.error('HTML Response preview:', htmlResponse.substring(0, 500));
        throw new Error(`API call to ${endpoint} returned HTML instead of JSON. This indicates a server routing issue.`);
      }
      
      return response;
    } catch (error) {
      console.error(`API DELETE Request failed to: ${url}`, error);
      
      throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },
};


export const authAPI = {
  login: async (identifier: string, password: string): Promise<any> => {
    try {
      console.log('Making login request to /auth/login');
      const response = await api.post('/auth/login', { identifier, password });
      
      // If we get here, response.ok is true (api.post throws if not OK)
      console.log('Response status:', response.status, 'Response URL:', response.url);
      
      // Check if response is not JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Received non-JSON response from login:', textResponse.substring(0, 500));
        throw new Error(`Expected JSON response but got ${contentType}. Response preview: ${textResponse.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success && data.user) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error details:', error);
      logger.error('API Error /auth/login', error instanceof Error ? error : undefined);
      // Re-throw the error so it can be handled by the calling code
      // The error message from api.post should already contain the server's error message
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      console.log('Making register request to /auth/register');
      const response = await api.post('/auth/register', userData);
      
      // If we get here, response.ok is true (api.post throws if not OK)
      console.log('Register response status:', response.status, 'Response URL:', response.url);
      
      // Check if response is not JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Received non-JSON response from register:', textResponse.substring(0, 500));
        throw new Error(`Expected JSON response but got ${contentType}. Response preview: ${textResponse.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Register response data:', data);

      if (data.success && data.user) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Register error details:', error);
      logger.error('API Error /auth/register', error instanceof Error ? error : undefined);
      // Re-throw the error so it can be handled by the calling code
      // The error message from api.post should already contain the server's error message
      throw error;
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
      localStorage.removeItem(USER_SESSION_KEY);
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout error', error instanceof Error ? error : undefined);
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
