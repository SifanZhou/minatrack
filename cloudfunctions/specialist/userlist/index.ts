import * as cloud from 'wx-server-sdk';
import { ErrorCode, AppError } from '../../../common/types/error';
import { ApiResponse } from '../../../common/types/api';
import { IQueryResult, IQuerySingleResult } from '../../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

interface UserListParams {
  limit?: number;
  offset?: number;
  status?: 'active' | 'pending';
}

interface UserDetailParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export const main = async (event: {
  action: 'list' | 'detail' | 'unbind';
  params?: UserListParams | UserDetailParams;
  userId?: string;
}): Promise<ApiResponse> => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { action } = event;

    switch (action) {
      case 'list':
        return await handleUserList(OPENID, event.params as UserListParams);
      case 'detail':
        return await handleUserDetail(OPENID, event.params as UserDetailParams);
      case 'unbind':
        return await handleUnbind(OPENID, event.userId);
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

async function handleUserList(openId: string, params?: UserListParams): Promise<ApiResponse> {
  const result = await db.collection('specialists')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  if (!result.data.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '专家不存在');
  }

  const specialistId = result.data[0]._id;
  const query: any = {
    specialistId,
    status: params?.status || 'active'
  };

  const bindings = await db.collection('bindings')
    .where(query)
    .orderBy('createdAt', 'desc')
    .get() as IQueryResult;

  if (!bindings.data.length) {
    return {
      success: true,
      data: []
    };
  }

  const userIds = bindings.data.map(b => b.userId);
  const users = await db.collection('users')
    .where({
      _id: db.command.in(userIds)
    })
    .get();

  const userMap = new Map(users.data.map(u => [u._id, u]));
  const bindingList = bindings.data.map(b => ({
    ...b,
    user: userMap.get(b.userId)
  }));

  return {
    success: true,
    data: bindingList
  };
}

async function handleUserDetail(openId: string, params: UserDetailParams): Promise<ApiResponse> {
  const { userId, startDate, endDate } = params;
  
  // 验证专家权限
  const result = await db.collection('bindings')
    .where({
      userId,
      specialistId: (await db.collection('specialists')
        .where({
          _openid: openId,
          status: 'active'
        })
        .get() as IQueryResult).data[0]?._id,
      status: 'active'
    })
    .get() as IQueryResult;

  if (!result.data.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '未找到绑定关系');
  }

  // 获取用户信息
  const user = await db.collection('users')
    .doc(userId)
    .get();

  // 获取测量记录
  const query: any = {
    userId,
    measuredAt: {}
  };

  if (startDate) {
    query.measuredAt.$gte = startDate;
  } else {
    query.measuredAt.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  if (endDate) {
    query.measuredAt.$lte = endDate;
  }

  const measurements = await db.collection('measurements')
    .where(query)
    .orderBy('measuredAt', 'desc')
    .get();

  return {
    success: true,
    data: {
      user: user.data,
      measurements: measurements.data
    }
  };
}

async function handleUnbind(openId: string, userId?: string): Promise<ApiResponse> {
  if (!userId) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '缺少用户ID');
  }

  const specialist = (await db.collection('specialists')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()).data[0];

  if (!specialist) {
    throw new AppError(ErrorCode.NOT_FOUND, '专家不存在');
  }

  const binding = await db.collection('bindings')
    .where({
      userId,
      specialistId: specialist._id,
      status: 'active'
    })
    .get();

  if (!binding.data.length) {
    throw new AppError(ErrorCode.NOT_FOUND, '未找到绑定关系');
  }

  await db.collection('bindings')
    .doc(binding.data[0]._id)
    .update({
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });

  return {
    success: true,
    data: { status: 'inactive' }
  };
}