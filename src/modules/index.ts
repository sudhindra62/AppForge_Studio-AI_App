/**
 * index.ts — Module Registry
 *
 * ARCHITECTURE NOTE:
 * This is the single entry point for all plug-and-play modules.
 * At application startup, this registry:
 *   1. Imports all module implementations
 *   2. Calls isEnabled() on each module
 *   3. Calls initialize() on all enabled modules
 *
 * To add a new module:
 *   1. Create src/modules/[name]/ implementing IAppModule
 *   2. Import it here and add to the MODULES array
 *   3. Add a feature flag in src/config/feature-flags.ts
 *
 * @see src/shared/interfaces/module.interface.ts
 * @see docs/modules/MODULES.md
 * @see docs/adr/ADR-003-module-isolation.md
 */

import type { IAppModule, ModuleMetadata } from '@/shared/interfaces/module.interface';

// ── Module Imports (added as modules are implemented) ─────────────
import { CSVImportModule } from './csv-import';
import { I18nModule } from './i18n';
import { PWAModule } from './pwa';
import { NotificationModule } from './notifications';

/**
 * All registered modules. Order matters: initialize() is called in order.
 * Phase 1: Empty array — modules registered in Phase 2+
 */
const MODULES: IAppModule[] = [
  new CSVImportModule(),
  new I18nModule(),
  new PWAModule(),
  new NotificationModule(),
];

/**
 * Initialize all enabled modules.
 * Call this from the root layout or Next.js instrumentation hook.
 */
export async function initializeModules(): Promise<void> {
  for (const mod of MODULES) {
    if (mod.isEnabled()) {
      try {
        await mod.initialize();
        console.log(`✅ Module initialized: ${mod.name} v${mod.version}`);
      } catch (error) {
        console.error(`❌ Module initialization failed: ${mod.name}`, error);
        // Modules should not crash the entire app on init failure
      }
    } else {
      console.log(`⏭️  Module disabled: ${mod.name}`);
    }
  }
}

/**
 * Tear down all modules on graceful shutdown.
 */
export async function teardownModules(): Promise<void> {
  for (const mod of MODULES.reverse()) {
    if (mod.isEnabled()) {
      try {
        await mod.teardown();
      } catch (error) {
        console.error(`❌ Module teardown failed: ${mod.name}`, error);
      }
    }
  }
}

/**
 * Get metadata for all modules (for admin dashboard display).
 */
export function getModuleMetadata(): ModuleMetadata[] {
  return MODULES.map((m) => ({
    name: m.name,
    version: m.version,
    description: '',
    isEnabled: m.isEnabled(),
    featureFlag: `FEATURE_${m.name.toUpperCase().replace(/\s+/g, '_')}`,
  }));
}
