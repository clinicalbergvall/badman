import { API_BASE_URL } from './config';
// Simple API client for authentication only
const authAPI = {
    login: async (identifier, password) => {
        try {
            // Always use relative paths in development to leverage Vite proxy
            const isDev = import.meta.env.MODE === 'development';
            const url = isDev
                ? '/api/auth/login'
                : `${API_BASE_URL}/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session management
                body: JSON.stringify({ identifier, password }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    register: async (userData) => {
        try {
            const isDev = import.meta.env.MODE === 'development';
            const url = isDev
                ? '/api/auth/register'
                : `${API_BASE_URL}/auth/register`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session management
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    getProfile: async () => {
        try {
            const isDev = import.meta.env.MODE === 'development';
            const url = isDev
                ? '/api/auth/me'
                : `${API_BASE_URL}/auth/me`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include', // Include cookies for session management
            });
            if (!response.ok) {
                if (response.status === 401) {
                    // Clear any local session data
                    localStorage.removeItem('userSession');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Get profile failed: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },
    logout: async () => {
        try {
            const isDev = import.meta.env.MODE === 'development';
            const url = isDev
                ? '/api/auth/logout'
                : `${API_BASE_URL}/auth/logout`;
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include', // Include cookies for session management
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Logout failed: ${response.status}`);
            }
            // Clear local session data
            localStorage.removeItem('userSession');
            return await response.json();
        }
        catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
};
export default authAPI;
