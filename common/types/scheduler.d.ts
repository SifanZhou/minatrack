export interface RenewalTask {
  userId: string;
  specialistId: string;
  subscriptionId: string;
  price: number;
  nextRenewalDate: Date;
}

export interface TaskResult {
  success: boolean;
  renewalCount: number;
  failedCount: number;
  errors?: Array<{
    subscriptionId: string;
    error: string;
  }>;
}