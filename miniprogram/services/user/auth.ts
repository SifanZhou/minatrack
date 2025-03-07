import { BaseService } from '../base/base';

export class UserAuthService extends BaseService {
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
}

export const userAuthService = new UserAuthService();