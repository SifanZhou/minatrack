export interface WeightChangeCategory {
  type: 'significant_decrease' | 'slight_decrease' | 'stable' | 'increase';
  count: number;
  users: Array<{
    userId: string;
    nickname: string;
    weightChange: number;
    weightChangePercent: number;
  }>;
}

export interface RiskWarning {
  abnormalIncrease: {
    count: number;
    users: Array<{
      userId: string;
      nickname: string;
      weightIncrease: number;
      weightIncreasePercent: number;
    }>;
  };
  noUpdate: {
    count: number;
    users: Array<{
      userId: string;
      nickname: string;
      lastMeasureDate: Date;
      daysSinceLastMeasure: number;
    }>;
  };
}

export interface SpecialistWeeklyReport {
  _id?: string;
  specialistId: string;
  startDate: Date;
  endDate: Date;
  weightDistribution: {
    categories: WeightChangeCategory[];
    totalUsers: number;
  };
  riskWarning: RiskWarning;
  createdAt: Date;
}