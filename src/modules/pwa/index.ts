/**
 * index.ts — PWA Module Public API
 */

import { IAppModule } from '@/shared/interfaces/module.interface';
import { featureFlags } from '@/config/feature-flags';

export class PWAModule implements IAppModule {
  readonly name = 'PWA';
  readonly version = '1.0.0';

  isEnabled(): boolean {
    return featureFlags.PWA;
  }

  async initialize(): Promise<void> {
    console.log('PWA module initialized');
  }

  async teardown(): Promise<void> {
    console.log('PWA module torn down');
  }
}

