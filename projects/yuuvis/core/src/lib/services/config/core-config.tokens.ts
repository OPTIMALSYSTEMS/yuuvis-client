import { InjectionToken } from '@angular/core';

import { CoreConfig } from './core-config';

/**
 * @ignore
 */
export const CUSTOM_CONFIG = new InjectionToken<CoreConfig>('CUSTOM_CONFIG');
export const CORE_CONFIG = new InjectionToken<CoreConfig>('CORE_CONFIG');