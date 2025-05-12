/**
 * Logger utility for centralized, level-based logging.
 * Allows silencing or setting verbosity for production vs. development.
 *
 * Usage:
 *   import { Logger } from '@/utils/logger';
 *   Logger.warn('message', context);
 */
export class Logger {
  static level: 'debug' | 'info' | 'warn' | 'error' | 'silent' = 'warn';

  static debug(...args: unknown[]) {
    if (['debug'].includes(Logger.level)) console.debug('[DEBUG]', ...args);
  }
  static info(...args: unknown[]) {
    if (['debug', 'info'].includes(Logger.level))
      console.info('[INFO]', ...args);
  }
  static warn(...args: unknown[]) {
    if (['debug', 'info', 'warn'].includes(Logger.level))
      console.warn('[WARN]', ...args);
  }
  static error(...args: unknown[]) {
    if (['debug', 'info', 'warn', 'error'].includes(Logger.level))
      console.error('[ERROR]', ...args);
  }
  static setLevel(level: typeof Logger.level) {
    Logger.level = level;
  }
}
