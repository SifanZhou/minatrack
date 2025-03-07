export interface HistoryQuery {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface QueryLogsParams {
  action: string;
  details: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface GenerateReportResult {
  success: boolean;
  report: {
    weightDistribution: {
      totalUsers: number;
    };
    riskWarning: {
      abnormalIncrease: {
        count: number;
      };
    };
  };
}

export interface RenewalParams {
  dryRun?: boolean;
  endDate?: Date;
  processed?: number;
}

export interface HistoryResult {
  success: boolean;
  reports?: Array<{
    weekStart: Date;
    weekEnd: Date;
    avgWeight: number;
    measureCount: number;
    weightTrend: number;
  }>;
  measurements?: Array<{
    _id: string;
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
    timestamp: Date;
  }>;
  total?: number;
  error?: string;
}