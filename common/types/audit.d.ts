export interface AuditLog {
  _id?: string;
  userId: string;
  action: 'login' | 'measurement' | 'subscription' | 'renewal' | 'device_bind' | 'alert';
  targetId?: string;
  details: {
    ip?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditLog['action'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}