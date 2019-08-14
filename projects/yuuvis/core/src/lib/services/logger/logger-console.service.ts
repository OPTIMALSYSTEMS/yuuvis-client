import { Injectable } from '@angular/core';
import { ILogger } from './logger.interface';

@Injectable({
  providedIn: 'root'
})
export class LoggerConsoleService implements ILogger {

  private apply(fn, args) {
    return console && console[fn] && console[fn](...args);
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
}
