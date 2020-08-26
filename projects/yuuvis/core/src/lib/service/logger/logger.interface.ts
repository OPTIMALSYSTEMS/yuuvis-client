/**
 * Interface providing a default logger, that is used for the Dependency-Injection (DI) token.
 */
export interface ILogger {
  debug(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
}
