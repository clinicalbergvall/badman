import { getApiUrl } from './config';
// Simple, focused authentication API client
const authAPI = {
    login: async (identifier, password) => {
        try {
            const response = await fetch(getApiUrl('auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session management
                mode: 'cors', // Explicitly set CORS mode
                body: JSON.stringify({ identifier, password }),
            });
            // Check if the response is a network error
            if (!response.ok && response.status === 0) {
                throw new Error('Network error: Unable to connect to the server');
            }
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
            const response = await fetch(getApiUrl('auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session management
                mode: 'cors', // Explicitly set CORS mode
                body: JSON.stringify(userData),
            });
            // Check if the response is a network error
            if (!response.ok && response.status === 0) {
                throw new Error('Network error: Unable to connect to the server');
            }
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
            const response = await fetch(getApiUrl('auth/me'), {
                method: 'GET',
                credentials: 'include', // Include cookies for session management
                mode: 'cors', // Explicitly set CORS mode
            });
            // Check if the response is a network error
            if (!response.ok && response.status === 0) {
                throw new Error('Network error: Unable to connect to the server');
            }
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
            const response = await fetch(getApiUrl('auth/logout'), {
                method: 'POST',
                credentials: 'include', // Include cookies for session management
                mode: 'cors', // Explicitly set CORS mode
            });
            // Check if the response is a network error
            if (!response.ok && response.status === 0) {
                throw new Error('Network error: Unable to connect to the server');
            }
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
