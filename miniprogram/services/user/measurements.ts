import { BaseService } from '../base/base';

interface BodyfatData {
  weight: number;
  bodyfat: number;
  bmi?: number;
  muscle?: number;
  water?: number;
  protein?: number;
  visceral?: number;
  bone?: number;
  metabolicAge?: number;
  date?: string;
  time?: string;
}

interface MeasurementsQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class UserMeasurementsService extends BaseService {
  async uploadBodyfat(data: BodyfatData): Promise<any> {
    return this.callFunction('user', {
      action: 'uploadBodyfat',
      data
    });
  }

  async getBodyfatHistory(startDate: string, endDate: string): Promise<any> {
    return this.callFunction('user', {
      action: 'getBodyfatHistory',
      startDate,
      endDate
    });
  }

  async getLatestBodyfat(): Promise<any> {
    return this.callFunction('user', {
      action: 'getLatestBodyfat'
    });
  }

  async getMeasurements(query: MeasurementsQuery): Promise<any> {
    return this.callFunction('user', {
      action: 'measurements',
      query
    });
  }

  async getMeasurementDetail(measurementId: string): Promise<any> {
    return this.callFunction('user', {
      action: 'measurement',
      measurementId
    });
  }
}

export const userMeasurementsService = new UserMeasurementsService();