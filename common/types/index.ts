export * from './user';
export * from './device';
export * from './specialist';
export * from './measurement';
export * from './subscription';

export interface WechatLoginResult {
  openid: string;
  session_key: string;
  unionid?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_PARAMS = 'INVALID_PARAMS',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface UserProfile {
  nickname?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  height?: number;
  age?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MeasurementData {
  weight: number;
  bodyFat?: number;
  muscle?: number;
  water?: number;
  bone?: number;
  bmi?: number;
  note?: string;
  createdAt: Date;
}