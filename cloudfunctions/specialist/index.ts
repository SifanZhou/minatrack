import * as cloud from 'wx-server-sdk';
import { ErrorCode, AppError } from '../../common/types/error';
import { ApiResponse } from '../../common/types/api';
import { IQueryResult } from '../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

interface SpecialistProfile {
  nickName: string;
  avatarUrl: string;
}

export const main = async (event: {
  action: 'login' | 'profile' | 'userlist' | 'userdetail' | 'unbind' | 'invite' | 'subscribe' | 'weekly';
  params?: any;
  userId?: string;
  profile?: SpecialistProfile;
}): Promise<ApiResponse> => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { action } = event;

    switch (action) {
      case 'login':
        const loginResult = (await cloud.callFunction({
          name: 'specialist-login',
          data: event
        }) as unknown) as { result: ApiResponse };
        return loginResult.result;
      case 'profile':
        return await handleProfile(OPENID || '', event.profile);
      case 'userlist':
      case 'userdetail':
      case 'unbind':
        const userResult = (await cloud.callFunction({
          name: 'specialist-userlist',
          data: {
            action: action === 'userlist' ? 'list' : action === 'userdetail' ? 'detail' : 'unbind',
            params: event.params,
            userId: event.userId
          }
        }) as unknown) as { result: ApiResponse };
        return userResult.result;
      case 'invite':
        const inviteResult = (await cloud.callFunction({
          name: 'specialist-invite',
          data: event
        }) as unknown) as { result: ApiResponse };
        return inviteResult.result;
      case 'subscribe':
        const subscribeResult = (await cloud.callFunction({
          name: 'specialist-subscription',
          data: event
        }) as unknown) as { result: ApiResponse };
        return subscribeResult.result;
      case 'weekly':
        const weeklyResult = (await cloud.callFunction({
          name: 'specialist-weekly',
          data: {
            specialistId: OPENID
          }
        }) as unknown) as { result: ApiResponse };
        return weeklyResult.result;
      default:
        throw new AppError(ErrorCode.INVALID_PARAMS, '无效的操作类型');
    }
  } catch (error) {
    const appError = AppError.fromError(error);
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message
      }
    };
  }
};

async function handleProfile(openId: string, profile?: SpecialistProfile): Promise<ApiResponse> {
  const result = await db.collection('specialists')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const specialists = result.data;

  if (!specialists.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '专家账号不存在');
  }

  if (!profile) {
    return {
      success: true,
      data: specialists[0]
    };
  }

  await db.collection('specialists').doc(String(specialists[0]._id)).update({
    data: {
      ...profile,
      updatedAt: new Date()
    }
  });

  return {
    success: true,
    data: {
      ...specialists[0],
      ...profile,
      updatedAt: new Date()
    }
  };
}