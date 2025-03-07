export interface Subscription {
  _id?: string;
  specialistId: string;
  userId: string;
  price: number;
  months: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'expired';
  autoRenew: boolean;
}

export interface SubscriptionParams {
  specialistId: string;
  months: number;
  autoRenew?: boolean;
}

export interface SubscriptionResult {
  success: boolean;
  subscription?: Subscription;
  paymentInfo?: any;
  error?: string;
}