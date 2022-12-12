import { Injectable } from '@angular/core';
import { AuthService, EventService, YuvEventType } from '@yuuvis/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

/**
 * Shows a message after completing each action.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  /**
   * Set to true to suppress any notifications
   */
  silent: boolean = false;

  /**
   * Default Notofication Options
   *
   */
  private options: Partial<IndividualConfig> = {
    closeButton: true,
    positionClass: 'toast-bottom-right',
    onActivateTick: true, // triggers change detection
    timeOut: 15000
  };
  /**
   *
   * @ignore
   */
  constructor(private toastrService: ToastrService, private authService: AuthService, private eventService: EventService) {
    this.authService.authenticated$.subscribe((a) => (this.silent = !a));
    this.eventService.on(YuvEventType.LOGOUT).subscribe(() => (this.silent = true));
  }

  /**
   * Show info colored massage (blue)
   *
   * @param string title
   * @param string msg
   */
  info(title: string, msg?: string) {
    this.toast(title, msg);
  }

  /**
   * Show confirm colored massage (blue)
   *
   * @param string title
   * @param string msg
   * @param onAdd
   * @param onRemove
   */
  confirm(title: string, msg?: string, onAdd?: any, onRemove?: any) {
    this.toast(title, msg, 'confirm', { onAdd, onRemove, timeOut: 7000 });
  }

  /**
   * Show success colored massage (green)
   * @param string title
   * @param string msg
   */
  success(title: string, msg?: string) {
    this.toast(title, msg, 'success');
  }

  /**
   * can not be in use
   *
   * @param string title
   * @param string msg
   */
  wait(title: string, msg?: string) {
    this.toast(title, msg, 'wait');
  }

  /**
   * Show error colored massage (red)
   *
   * @param string title
   * @param string msg
   */
  error(title: string, msg?: string) {
    this.toast(title, msg, 'error', {
      closeButton: true,
      timeOut: 7000
    });
  }

  /**
   * Show warning colored massage (yellow)
   *
   * @param string title
   * @param string msg
   */
  warning(title: string, msg?: string) {
    this.toast(title, msg, 'warning');
  }

  /**
   * Public wrapper for accessing the Toastr
   *
   * @param string title
   * @param string msg
   * @param string mode
   * @param _options
   */
  private toast(title: string, msg: string, mode?: string, _options?: {}) {
    let options: any = Object.assign({}, this.options, _options);
    // options.title = title || '';
    // options.msg = msg || '';
    this.doToast(msg, title, options, mode);
  }

  /**
   * Accessing the toastr service
   *
   * @param string msg
   * @param string title
   * @param options
   * @param string mode
   */
  private doToast(msg: string, title: string, options: any, mode?: string) {
    switch (mode) {
      case 'success': {
        this.toastrService.success(msg, title, options);
        break;
      }
      // case 'wait': {
      //   this.toastrService.wait(msg, title, options);
      //   break;
      // }
      case 'error': {
        this.toastrService.error(msg, title, options);
        break;
      }
      case 'warning': {
        this.toastrService.warning(msg, title, options);
        break;
      }
      case 'confirm': {
        this.toastrService.info(msg, title, options);
        break;
      }
      default: {
        this.toastrService.info(msg, title, options);
      }
    }
  }
}
