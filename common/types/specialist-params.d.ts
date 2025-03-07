import { SpecialistProfile } from './specialist';

export interface WxUserInfo {
  nickName: string;
  avatarUrl: string;
}

export interface BindingParams {
  inviteCode: string;
}

export type SpecialistAction = 
  | 'login'
  | 'profile'
  | 'bind'
  | 'report'
  | 'invite'
  | 'subscribe'
  | 'weekly-report'
  | 'subscription';

export interface SpecialistFunctionParams {
  action: SpecialistAction;
  wxUserInfo?: WxUserInfo;
  profile?: SpecialistProfile;
  params?: BindingParams;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}