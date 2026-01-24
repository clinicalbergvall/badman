class Logger {
    constructor() {
        Object.defineProperty(this, "logs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxLogs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
    }
    error(message, error, metadata) {
        const entry = {
            level: 'error',
            message,
            timestamp: new Date(),
            metadata,
            stack: error?.stack
        };
        this.addLog(entry);
        console.error(`[ERROR] ${message}`, { error, metadata });
        if (import.meta.env.PROD) {
        }
    }
    warn(message, metadata) {
        const entry = {
            level: 'warn',
            message,
            timestamp: new Date(),
            metadata
        };
        this.addLog(entry);
        console.warn(`[WARN] ${message}`, metadata);
    }
    info(message, metadata) {
        const entry = {
            level: 'info',
            message,
            timestamp: new Date(),
            metadata
        };
        this.addLog(entry);
        console.info(`[INFO] ${message}`, metadata);
    }
    debug(message, metadata) {
        if (import.meta.env.DEV) {
            const entry = {
                level: 'debug',
                message,
                timestamp: new Date(),
                metadata
            };
            this.addLog(entry);
            console.debug(`[DEBUG] ${message}`, metadata);
        }
    }
    addLog(entry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }
    getLogs() {
        return [...this.logs];
    }
    clearLogs() {
        this.logs = [];
    }
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}
export const logger = new Logger();
export default Logger;
