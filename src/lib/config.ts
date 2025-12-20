// Centralized API configuration
// This ensures consistent API URLs across the entire application

const VITE_API_URL = import.meta.env.VITE_API_URL
const OVERRIDE_API_URL = typeof window !== 'undefined'
  ? (localStorage.getItem('apiOverride') || '')
  : ''

// Validate in production
if (!VITE_API_URL && import.meta.env.MODE === 'production') {
    console.error('CRITICAL: VITE_API_URL environment variable is not set in production!')
    console.error('Please set VITE_API_URL in your .env file or deployment configuration')
}

const BASE = OVERRIDE_API_URL || VITE_API_URL || 'https://clean-cloak-b.onrender.com/api'
export const API_BASE_URL = BASE.endsWith('/api') ? BASE : `${BASE}/api`

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
    const base = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${base}${cleanEndpoint}`
}

// Log configuration in development
if (import.meta.env.MODE === 'development') {
    console.log('API Configuration:', {
        mode: import.meta.env.MODE,
        apiUrl: API_BASE_URL,
        envVarSet: !!VITE_API_URL,
        overrideSet: !!OVERRIDE_API_URL
    })
}

export const setApiOverride = (url: string) => {
  try {
    const trimmed = url.trim()
    localStorage.setItem('apiOverride', trimmed)
    window.location.reload()
  } catch {}
}
