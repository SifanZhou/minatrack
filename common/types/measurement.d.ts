export interface RawMeasurement {
  weight: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number;
  healthScore: number;
  measuredAt: Date;
}

export interface ProcessedMeasurement extends RawMeasurement {
  userId: string;
  deviceId: string;
}

// 保留 Measurement 接口，删除重复的 RawMeasurement 和 ProcessedMeasurement
export interface Measurement {
  _id: string;
  userId: string;
  deviceId: string;
  weight: number;
  bmi: number;
  bodyFat: number;
  bodyWater: number;
  protein: number;
  muscle: number;
  boneMass: number;
  visceralFat: number;
  basalMetabolism: number;
  bodyAge: number;
  bodyScore: number;
  bodyType: string;
  measuredAt: Date;
}

export interface MeasurementHistory extends ApiResponse {
  data: {
    list: Measurement[];
    total: number;
  };
}

export interface MeasurementStats extends ApiResponse {
  data: {
    latest: Measurement;
    weeklyAvg: {
      weight: number;
      bodyFat: number;
    };
    monthlyTrend: {
      weight: number[];
      bodyFat: number[];
      dates: string[];
    };
  };
}