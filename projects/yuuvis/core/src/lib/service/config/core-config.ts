import { Inject } from '@angular/core';
import { OpenIdConfig } from '../backend/backend.interface';
import { YuvConfig } from './config.interface';
import { CUSTOM_CONFIG } from './core-config.tokens';

/**
 * @ignore
 */
export class CoreConfig {
  main?: YuvConfig | string[] = ['assets/default/config/main.json'];
  translations?: string[] = ['assets/default/i18n/'];
  environment?: { production: boolean } = { production: true };
  oidc?: OpenIdConfig;

  constructor(@Inject(CUSTOM_CONFIG) __config: CoreConfig) {
    Object.assign(this, __config);
  }
}
