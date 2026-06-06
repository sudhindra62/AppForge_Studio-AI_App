/**
 * index.ts — i18n Module Public API
 */

import { IAppModule } from '@/shared/interfaces/module.interface';
import { featureFlags } from '@/config/feature-flags';

export class I18nModule implements IAppModule {
  readonly name = 'i18n';
  readonly version = '1.0.0';

  isEnabled(): boolean {
    return featureFlags.I18N;
  }

  async initialize(): Promise<void> {
    console.log('i18n module initialized');
  }

  async teardown(): Promise<void> {
    console.log('i18n module torn down');
  }
}

