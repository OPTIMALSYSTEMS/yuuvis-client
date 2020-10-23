import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { ILogger } from './logger.interface';
/**
 * @ignore
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerConsoleService implements ILogger {
  constructor(private config: ConfigService) {}

  private styles = {
    info: 'color:blue',
    debug: 'background: orange',
    warn: 'background: rgba(255,0,0,.2);color: red',
    error: 'background: red; color: #fff'
  };

  private apply(fn, args) {
    args = [`%c${fn}:`, 'font-family: monospace; font-size: 10px; padding: 2px 4px;' + this.styles[fn], ...args];
    return this.shouldLog(fn) ? console && console[fn] && console[fn](...args) : null;
  }

  public debug(...args: any[]): void {
    this.apply('debug', args);
  }

  public error(...args: any[]): void {
    this.apply('error', args);
  }

  public info(...args: any[]): void {
    this.apply('info', args);
  }

  public log(...args: any[]): void {
    this.apply('log', args);
  }

  public warn(...args: any[]): void {
    this.apply('warn', args);
  }

  private shouldLog(level: string) {
    let should = false;
    const cfg = this.config.get('core.logging');
    if (!cfg || !cfg.level) return false;

    switch (cfg.level) {
      case 'debug': {
        should = true;
        break;
      }
      case 'error': {
        should = ['error'].includes(level);
        break;
      }
      case 'warn': {
        should = ['warn', 'error'].includes(level);
        break;
      }
      case 'info': {
        should = ['info', 'warn', 'error'].includes(level);
        break;
      }
      default: {
      }
    }
    return should;
  }
}
