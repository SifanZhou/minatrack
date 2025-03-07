import { AuditLog } from './audit';

export interface QueryLogsResult {
  success: boolean;
  logs: AuditLog[];
  total: number;
  error?: string;
}