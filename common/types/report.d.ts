export interface WeeklyReport {
  _id?: string;
  userId: string;
  specialistId?: string;
  startDate: Date;
  endDate: Date;
  metrics: {
    weights: {
      value: number;
      date: Date;
    }[];
    avgWeight: number;
    minWeight: number;
    maxWeight: number;
    weightTrend: number;  // 周内体重变化：正数表示增加，负数表示减少
    measureCount: number;
  };
  createdAt: Date;
}

export interface ReportResult {
  success: boolean;
  report?: WeeklyReport;
  error?: string;
}