/**
 * Logger abstraction for the LSP server.
 * Allows swapping the underlying logger implementation without changing consuming code.
 */

/**
 * Log levels in order of severity.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface for dependency injection.
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * No-op logger that discards all messages.
 * Useful for testing or when logging is disabled.
 */
export const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * Console-based logger for development.
 * In production, this should be replaced with the LSP connection's console.
 */
export const consoleLogger: Logger = {
  debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
  info: (message, ...args) => console.info(`[INFO] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
};

/**
 * Creates a prefixed logger that adds a prefix to all messages.
 *
 * @param logger - The underlying logger
 * @param prefix - The prefix to add to messages
 * @returns A new logger with prefixed messages
 */
export function createPrefixedLogger(logger: Logger, prefix: string): Logger {
  return {
    debug: (message, ...args) => logger.debug(`[${prefix}] ${message}`, ...args),
    info: (message, ...args) => logger.info(`[${prefix}] ${message}`, ...args),
    warn: (message, ...args) => logger.warn(`[${prefix}] ${message}`, ...args),
    error: (message, ...args) => logger.error(`[${prefix}] ${message}`, ...args),
  };
}
