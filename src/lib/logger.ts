// Comprehensive logging system
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private logQueue: LogEntry[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    return `[${timestamp}] ${entry.level}: ${entry.message} ${contextStr}`.trim();
  }

  private writeLog(entry: LogEntry) {
    const formattedLog = this.formatLog(entry);
    
    switch (entry.level) {
      case 'ERROR':
        console.error(formattedLog);
        break;
      case 'WARN':
        console.warn(formattedLog);
        break;
      case 'DEBUG':
        if (!this.isProduction) console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }

    // In production, you'd also send to external logging service
    // if (this.isProduction) {
    //   // Send to DataDog, LogRocket, Sentry, etc.
    // }
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context,
      userId
    };
    this.writeLog(entry);
  }

  warn(message: string, context?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context,
      userId
    };
    this.writeLog(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      context: {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      },
      userId
    };
    this.writeLog(entry);
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        context
      };
      this.writeLog(entry);
    }
  }

  // Log API requests
  apiRequest(method: string, url: string, userId?: string, ip?: string, userAgent?: string) {
    this.info('API Request', {
      method,
      url,
      ip,
      userAgent
    }, userId);
  }

  // Log authentication events
  authEvent(event: 'login' | 'register' | 'logout' | 'failed_login', userId?: string, ip?: string, details?: Record<string, any>) {
    this.info(`Auth Event: ${event}`, {
      ...details,
      ip
    }, userId);
  }
}

// Singleton instance
export const logger = new Logger();

// Error boundary for uncaught exceptions
if (typeof window === 'undefined') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)));
  });
}