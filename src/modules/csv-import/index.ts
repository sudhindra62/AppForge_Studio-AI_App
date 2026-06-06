/**
 * index.ts — CSV Import Module Public API
 */

import { IAppModule } from '@/shared/interfaces/module.interface';
import { featureFlags } from '@/config/feature-flags';

export class CSVImportModule implements IAppModule {
  readonly name = 'CSV Import';
  readonly version = '1.0.0';

  isEnabled(): boolean {
    return featureFlags.CSV_IMPORT;
  }

  async initialize(): Promise<void> {
    console.log('CSV Import module initialized');
  }

  async teardown(): Promise<void> {
    console.log('CSV Import module torn down');
  }
}

export { CSVImportWizard } from './components/CSVImportWizard';


