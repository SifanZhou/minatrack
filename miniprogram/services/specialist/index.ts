import { BaseService } from '../base/base';

interface SpecialistProfile {
  name?: string;
  title?: string;
  introduction?: string;
  avatarUrl?: string;
  certificates?: string[];
  [key: string]: any;
}

interface ReportData {
  title: string;
  content: string;
  recommendations: string[];
  [key: string]: any;
}

interface PlanData {
  planId: string;
  price: number;
  duration: number;
  [key: string]: any;
}

export class SpecialistService extends BaseService {
  async login(): Promise<any> {
    try {
      const { code } = await wx.login();
      return this.callFunction('specialist', { 
        action: 'login',
        code
      });
    } catch (error) {
      console.error('微信登录失败', error);
      throw new Error('微信登录失败');
    }
  }

  async getProfile(): Promise<any> {
    return this.callFunction('specialist', {
      action: 'profile'
    });
  }

  async updateProfile(profile: SpecialistProfile): Promise<any> {
    return this.callFunction('specialist', {
      action: 'profile',
      profile
    });
  }

  async getClients(): Promise<any> {
    return this.callFunction('specialist', {
      action: 'userlist'
    });
  }

  async getClientDetail(userId: string): Promise<any> {
    return this.callFunction('specialist', {
      action: 'userdetail',
      userId
    });
  }

  async generateWeeklyReport(userId: string): Promise<any> {
    return this.callFunction('specialist', {
      action: 'weekly',
      userId
    });
  }

  async getSubscriptionPlans(): Promise<any> {
    return this.callFunction('specialist', {
      action: 'subscription',
      type: 'plans'
    });
  }

  async subscribe(planId: string): Promise<any> {
    return this.callFunction('specialist', {
      action: 'subscription',
      type: 'subscribe',
      planId
    });
  }

  async getServiceCode(): Promise<any> {
    return this.callFunction('specialist', {
      action: 'invite',
      type: 'get'
    });
  }

  async generateServiceCode(): Promise<any> {
    return this.callFunction('specialist', {
      action: 'invite',
      type: 'generate'
    });
  }
}

export const specialistService = new SpecialistService();