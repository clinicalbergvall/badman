

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const entry: LogEntry = {
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

  
  warn(message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date(),
      metadata
    };

    this.addLog(entry);
    console.warn(`[WARN] ${message}`, metadata);
  }

  
  info(message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date(),
      metadata
    };

    this.addLog(entry);
    console.info(`[INFO] ${message}`, metadata);
  }

  
  debug(message: string, metadata?: Record<string, any>) {
    if (import.meta.env.DEV) {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date(),
        metadata
      };

      this.addLog(entry);
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }

  
  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  
  clearLogs() {
    this.logs = [];
  }

  
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}


export const logger = new Logger();


export default Logger;