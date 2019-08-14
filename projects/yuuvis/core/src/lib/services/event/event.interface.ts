/**
 * Triggerable and Subscribable events
 */
export interface YuvEvent {
    /**
     * type
     */
    type: string;
    /**
     * data to be passed along with the event
     */
    data?: any;
  }