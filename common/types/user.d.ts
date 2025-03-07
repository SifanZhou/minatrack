export interface User {
  _id: string;
  openId: string;
  unionId?: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'specialist';
  createdAt: Date;
}

export interface LoginParams {
  code: string;
  userInfo?: WechatUserInfo;
}

export interface LoginResult extends ApiResponse {
  status?: 'success' | 'error';
  success?: boolean;
  data: {
    token: string;
    user: User;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface WechatUserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number;
}