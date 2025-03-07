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

export class UserProfileService extends BaseService {
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
}

export const userProfileService = new UserProfileService();