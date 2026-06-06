export interface IAppModule {
  readonly name: string;
  readonly version: string;
  isEnabled(): boolean;
  initialize(): Promise<void>;
  teardown(): Promise<void>;
}

export interface ModuleMetadata {
  name: string;
  version: string;
  description: string;
  isEnabled: boolean;
  featureFlag: string;
}
