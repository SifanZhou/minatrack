export interface Specialist {
  _id: string;
  openId: string;
  unionId?: string;
  nickname: string;
  avatar: string;
  serviceCode: string;
  status: 'active' | 'inactive';
  subscription?: {
    endDate: Date;
    plan: 'month' | 'quarter' | 'year';
  };
}

export interface SpecialistLoginResult extends ApiResponse {
  data: {
    token: string;
    specialist: Specialist;
  };
}

export interface ClientInfo {
  userId: string;
  nickname: string;
  avatar: string;
  bindTime: Date;
  lastMeasurement?: {
    weight: number;
    measuredAt: Date;
  };
}

export interface InviteCodeResult extends ApiResponse {
  data: {
    code: string;
    expireAt: Date;
  };
}

export interface SubscriptionStatus extends ApiResponse {
  data: {
    active: boolean;
    plan?: string;
    endDate?: Date;
  };
}

export interface ClientListResponse extends ApiResponse {
  data: {
    list: ClientInfo[];
    total: number;
  };
}