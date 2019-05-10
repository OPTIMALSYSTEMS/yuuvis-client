import { Inject } from '@angular/core';

import { CUSTOM_CONFIG } from './core-config.tokens';
import { EnaioConfig } from './config.interface';

/**
 * @ignore
 */
export class CoreConfig {
    
    main?: EnaioConfig | string[] = ['assets/_default/config/main.json'];
    translations?: string[] = ['assets/_default/i18n/'];  
    environment?: { production: boolean } = {production: true};
  
    constructor(@Inject(CUSTOM_CONFIG) __config: CoreConfig) {
      Object.assign(this, __config);
    }
  }
  