// Logging utility for production-safe logging
// Replaces console.log/error/warn statements throughout the app

type LogLevel = 'info' | 'warn' | 'error'

class Logger {
    private isDevelopment = import.meta.env.MODE !== 'production'

    private log(level: LogLevel, message: string, data?: any) {
        // Always log in development
        if (this.isDevelopment) {
            const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
            const timestamp = new Date().toISOString()
            logFn(`[${timestamp}] [${level.toUpperCase()}]`, message, data || '')
        }

        // In production, only log errors (and send to error tracking service if configured)
        if (!this.isDevelopment && level === 'error') {
            console.error(message, data)
            // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
            // Example: Sentry.captureException(new Error(message), { extra: data })
        }
    }

    info(message: string, data?: any) {
        this.log('info', message, data)
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data)
    }

    error(message: string, error?: any) {
        this.log('error', message, error)
    }

    // Helper for API errors
    apiError(endpoint: string, error: any) {
        this.error(`API Error: ${endpoint}`, {
            message: error?.message,
            status: error?.status,
            response: error?.response
        })
    }
}

export const logger = new Logger()
