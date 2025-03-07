import * as cloud from 'wx-server-sdk';
import { ApiResponse } from '../../common/types/api';
import { ErrorCode, AppError } from '../../common/types/error';
import { IQueryResult, IAddResult, WxContext } from '../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

interface UserProfile {
  nickname?: string;
  height?: number;
  targetWeight?: number;
}

interface CallFunctionResult {
  result: any;
  errMsg?: string;
}

export const main = async (event: {
  action: 'login' | 'profile' | 'bind' | 'measurement' | 'measurements';
  profile?: UserProfile;
  inviteCode?: string;
  data?: any;
  measurementId?: string;
  query?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  };
}): Promise<ApiResponse> => {
  try {
    const { OPENID } = cloud.getWXContext() as WxContext;
    if (!OPENID) {
      throw new AppError(ErrorCode.UNAUTHORIZED, '未获取到用户身份');
    }

    const { action } = event;

    switch (action) {
      case 'login':
        return await handleLogin(OPENID);
      case 'profile':
        return await handleProfile(OPENID, event.profile);
      case 'bind':
        const bindResult = (await cloud.callFunction({
          name: 'user-bind',
          data: { inviteCode: event.inviteCode }
        }) as unknown) as CallFunctionResult;
        if (!bindResult.result.success) {
          return {
            success: false,
            error: {
              code: ErrorCode.INVALID_PARAMS,
              message: bindResult.result.error?.message || '绑定失败'
            }
          };
        }
        return {
          success: true,
          data: bindResult.result.data
        };
      case 'measurement':
        const measurementResult = (await cloud.callFunction({
          name: 'user-measurement',
          data: {
            data: event.data,
            measurementId: event.measurementId
          }
        }) as unknown) as CallFunctionResult;
        if (!measurementResult.result.success) {
          return {
            success: false,
            error: {
              code: ErrorCode.INVALID_PARAMS,
              message: measurementResult.result.error?.message || '操作失败'
            }
          };
        }
        return {
          success: true,
          data: measurementResult.result.data
        };
      case 'measurements':
        return await handleMeasurements(OPENID, event.query);
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

async function handleLogin(openId: string): Promise<ApiResponse> {
  const result = await db.collection('users')
    .where({
      _openid: openId
    })
    .get() as IQueryResult;

  const users = result.data;

  if (!users.length) {
    const newUser = {
      _openid: openId,
      status: 'active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    const addResult = await db.collection('users').add({
      data: newUser
    }) as IAddResult;

    return {
      success: true,
      data: {
        _id: addResult._id,
        ...newUser
      }
    };
  }

  await db.collection('users').doc(users[0]._id).update({
    data: {
      lastLoginAt: new Date()
    }
  });

  return {
    success: true,
    data: users[0]
  };
}

async function handleProfile(openId: string, profile?: UserProfile): Promise<ApiResponse> {
  const result = await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const users = result.data;

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  if (!profile) {
    return {
      success: true,
      data: users[0]
    };
  }

  if (profile.height && (profile.height < 100 || profile.height > 250)) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '身高数据无效');
  }

  await db.collection('users').doc(users[0]._id).update({
    data: {
      ...profile,
      updatedAt: new Date()
    }
  });

  return {
    success: true,
    data: {
      ...users[0],
      ...profile,
      updatedAt: new Date()
    }
  };
}

async function handleMeasurements(openId: string, query?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<ApiResponse> {
  const result = await db.collection('users')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const users = result.data;

  if (!users.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在');
  }

  const where: any = {
    userId: users[0]._id
  };

  if (query?.startDate || query?.endDate) {
    where.measuredAt = {};
    if (query.startDate) {
      where.measuredAt.$gte = query.startDate;
    }
    if (query.endDate) {
      where.measuredAt.$lte = query.endDate;
    }
  }

  const measurements = await db.collection('measurements')
    .where(where)
    .orderBy('measuredAt', 'desc')
    .get() as IQueryResult;

  return {
    success: true,
    data: measurements.data
  };
}