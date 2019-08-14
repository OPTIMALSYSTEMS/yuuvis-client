import { ILogger } from './logger.interface';

/**
 * Set up the default logger.
 * The default logger doesn't actually log anything;
 * but, it provides the Dependency-Injection (DI) token that the rest of the 
 * application can use for dependency resolution. Each platform can then override 
 * this with a platform-specific logger implementation.
 *
 * @ignore
 */
export class Logger implements ILogger {

  public error(...args: any[]): void {
    // ... the default logger does no work.
  }

  public debug(...args: any[]): void {
    // ... the default logger does no work.
  }

  public info(...args: any[]): void {
    // ... the default logger does no work.
  }

  public log(...args: any[]): void {
    // ... the default logger does no work.
  }

  public warn(...args: any[]): void {
    // ... the default logger does no work.
  }

}