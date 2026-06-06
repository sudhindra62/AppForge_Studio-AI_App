import { IAppModule } from '@/shared/interfaces/module.interface';
import { featureFlags } from '@/config/feature-flags';

export class NotificationModule implements IAppModule {
  readonly name = 'Notifications';
  readonly version = '1.0.0';

  isEnabled(): boolean {
    return featureFlags.NOTIFICATIONS;
  }

  async initialize(): Promise<void> {
    console.log('Notifications module initialized');
  }

  async teardown(): Promise<void> {
    console.log('Notifications module torn down');
  }
}
