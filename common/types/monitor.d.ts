export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  userId?: string;
}

export interface Alert {
  _id?: string;
  level: AlertLevel;
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  createdAt: Date;
  status: 'active' | 'resolved';
  resolvedAt?: Date;
}