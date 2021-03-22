export interface PopoverConfig<T = any> {
  /** @ignore */
  backdropClass?: string;
  /** @ignore */
  disableClose?: boolean;
  /** @ignore */
  disableSmallScreenClose?: boolean;
  disposeOnNavigation?: boolean;
  /** @ignore */
  panelClass?: string | string[];
  width?: number | string;
  /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
  height?: number | string;
  /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
  minWidth?: number | string;
  /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
  minHeight?: number | string;
  /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
  maxWidth?: number | string;
  /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
  maxHeight?: number | string;
  data?: T;
  /** The time in seconds, that the overlay should exist. */
  duration?: number;
  /**@ignore */
  top?: number;
  /**@ignore */
  bottom?: number;
  /**@ignore */
  left?: number;
  /**@ignore */
  right?: number;
}

export interface ConfirmPopoverData {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancelButton?: boolean;
}
