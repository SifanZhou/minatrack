import { BaseService } from '../base/base';

interface UserProfile {
  nickname?: string;
  gender?: number;
  age?: number;
  height?: number;
  targetWeight?: number;
  avatarUrl?: string;
  [key: string]: any;
}

interface MeasurementData {
  weight: number;
  bodyFat?: number;
  muscle?: number;
  bmi?: number;
  [key: string]: any;
}

export class UserService extends BaseService {
  async login(): Promise<any> {
    try {
      const { code } = await wx.login();
      return this.callFunction('user', { 
        action: 'login',
        code
      });
    } catch (error) {
      console.error('微信登录失败', error);
      throw new Error('微信登录失败');
    }
  }

  async getProfile(): Promise<any> {
    return this.callFunction('user', {
      action: 'profile'
    });
  }

  async updateProfile(profile: UserProfile): Promise<any> {
    return this.callFunction('user', {
      action: 'profile',
      profile
    });
  }

  async bindSpecialist(inviteCode: string): Promise<any> {
    return this.callFunction('user', {
      action: 'bind',
      inviteCode
    });
  }

  async addMeasurement(data: MeasurementData): Promise<any> {
    return this.callFunction('user', {
      action: 'measurement',
      data
    });
  }

  async getMeasurements(params?: { 
    limit?: number, 
    offset?: number,
    startDate?: Date,
    endDate?: Date
  }): Promise<any> {
    return this.callFunction('user', {
      action: 'measurements',
      query: params
    });
  }

  async getMeasurementDetail(measurementId: string): Promise<any> {
    return this.callFunction('user', {
      action: 'measurement',
      measurementId
    });
  }
}

import { userAuthService } from './auth';
import { userProfileService } from './profile';
import { userMeasurementsService } from './measurements';

// 为了兼容现有代码，提供一个统一的服务对象
export const userService = {
  // 认证相关
  login: userAuthService.login.bind(userAuthService),
  
  // 资料相关
  getProfile: userProfileService.getProfile.bind(userProfileService),
  updateProfile: userProfileService.updateProfile.bind(userProfileService),
  bindSpecialist: userProfileService.bindSpecialist.bind(userProfileService),
  
  // 测量相关
  addMeasurement: userMeasurementsService.uploadBodyfat.bind(userMeasurementsService),
  getMeasurements: userMeasurementsService.getMeasurements.bind(userMeasurementsService),
  getMeasurementDetail: userMeasurementsService.getMeasurementDetail.bind(userMeasurementsService),
  getBodyfatHistory: userMeasurementsService.getBodyfatHistory.bind(userMeasurementsService),
  getLatestBodyfat: userMeasurementsService.getLatestBodyfat.bind(userMeasurementsService)
};

export {
  userAuthService,
  userProfileService,
  userMeasurementsService
};