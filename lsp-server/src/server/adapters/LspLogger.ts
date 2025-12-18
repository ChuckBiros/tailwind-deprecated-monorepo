import type { Connection } from 'vscode-languageserver/node';

import type { Logger } from '../../utils/logger';

/**
 * Creates a Logger that writes to the LSP connection console.
 *
 * @param connection - The LSP connection
 * @returns A Logger implementation
 */
export function createLspLogger(connection: Connection): Logger {
  return {
    debug: (message, ...args) => {
      connection.console.log(`[DEBUG] ${formatMessage(message, args)}`);
    },
    info: (message, ...args) => {
      connection.console.info(formatMessage(message, args));
    },
    warn: (message, ...args) => {
      connection.console.warn(formatMessage(message, args));
    },
    error: (message, ...args) => {
      connection.console.error(formatMessage(message, args));
    },
  };
}

/**
 * Formats a log message with optional arguments.
 */
function formatMessage(message: string, args: unknown[]): string {
  if (args.length === 0) {
    return message;
  }

  const formattedArgs = args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack ?? arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  return `${message} ${formattedArgs}`;
}

