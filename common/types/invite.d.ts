export interface Invite {
  _id?: string;
  specialistId: string;
  inviteCode: string;
  status: 'pending' | 'used' | 'expired';
  createdAt: Date;
  expireAt: Date;
  usedBy?: string;
  usedAt?: Date;
}

export interface InviteResult {
  success: boolean;
  inviteLink?: string;
  error?: string;
}