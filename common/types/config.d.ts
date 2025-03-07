export interface SystemConfig {
  appId: string;
  env: string;
  version: string;
  payment: {
    minAmount: number;
    maxAmount: number;
    currency: string;
  };
  subscription: {
    trialDays: number;
    defaultDuration: number;
    maxRenewalTimes: number;
  };
  device: {
    supportedBrands: string[];
    connectionTimeout: number;
    maxRetries: number;
  };
  security: {
    tokenExpiry: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
}