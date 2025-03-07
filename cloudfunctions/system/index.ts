import * as cloud from 'wx-server-sdk';
import { ErrorCode, AppError } from '../../common/types/error';
import { ApiResponse } from '../../common/types/api';
import { IQueryResult, IAddResult, ICountResult, WxContext } from '../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

interface SystemConfig {
  version: string;
  minVersion: string;
  maintenance?: {
    enabled: boolean;
    message?: string;
    startTime?: Date;
    endTime?: Date;
  };
  features?: {
    [key: string]: boolean;
  };
}

interface NoticeData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error';
  startTime?: Date;
  endTime?: Date;
  targetUsers?: string[];
}

export const main = async (event: SystemParams): Promise<ApiResponse<any>> => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new AppError(ErrorCode.UNAUTHORIZED, '未授权访问');
    }
    const openId = OPENID;
    const { action } = event;

    switch (action) {
      case 'config':
        return await handleConfig(OPENID, event.config) as ApiResponse<any>;
      case 'notice':
        return await handleNotice(OPENID, event.notice) as ApiResponse<any>;
      case 'stats':
        return await handleStats(OPENID) as ApiResponse<any>;
      case 'feedback':
        return await handleFeedback(OPENID, event.feedback) as ApiResponse<any>;
      case 'monitor':
        return await handleMonitor(OPENID) as ApiResponse<any>;
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

async function handleConfig(openId: string, config?: SystemConfig): Promise<ApiResponse<any>> {
  // 验证管理员权限
  const adminResult = await db.collection('admins')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const admins = adminResult.data;

  if (!admins.length) {
    throw new AppError(ErrorCode.UNAUTHORIZED, '无权限访问系统配置');
  }

  if (!config) {
    const configResult = await db.collection('configs')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get() as IQueryResult;

    return {
      success: true as const,
      data: configResult.data[0] || null
    };
  }

  // 验证版本号格式
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(config.version) || !versionRegex.test(config.minVersion)) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '版本号格式无效');
  }

  const addConfigResult = await db.collection('configs').add({
    data: {
      ...config,
      createdAt: new Date(),
      createdBy: openId
    }
  }) as IAddResult;

  return {
    success: true as const,
    data: { _id: addConfigResult._id, ...config }
  };
}

async function handleNotice(openId: string, notice?: NoticeData): Promise<ApiResponse<any>> {
  const adminResult = await db.collection('admins')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const admins = adminResult.data;

  if (notice && !admins.length) {
    throw new AppError(ErrorCode.UNAUTHORIZED, '无权限发布公告');
  }

  if (!notice) {
    const now = new Date();
    const noticeResult = await db.collection('notices')
      .where({
        startTime: db.command.lte(now),
        endTime: db.command.gte(now)
      })
      .orderBy('createdAt', 'desc')
      .get() as IQueryResult;

    return {
      success: true as const,
      data: noticeResult.data
    };
  }

  if (!notice.title || !notice.content) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '公告标题和内容不能为空');
  }

  const addNoticeResult = await db.collection('notices').add({
    data: {
      ...notice,
      createdAt: new Date(),
      createdBy: openId
    }
  }) as IAddResult;

  return {
    success: true as const,
    data: { _id: addNoticeResult._id, ...notice }
  };
}

interface SystemParams {
  action: 'config' | 'notice' | 'stats' | 'feedback' | 'monitor' | 'log';
  config?: SystemConfig;
  notice?: NoticeData;
  feedback?: { content: string; type: string; images?: string[] };
  data?: any;
}

async function handleStats(openId: string): Promise<ApiResponse<any>> {
  const result = await db.collection('admins')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get() as IQueryResult;

  const admins = result.data;

  if (!admins.length) {
    throw new AppError(ErrorCode.UNAUTHORIZED, '无权限查看统计数据');
  }

  const [
    usersResult,
    specialistsResult,
    measurementsResult
  ] = await Promise.all([
    db.collection('users').where({ status: 'active' }).count() as Promise<ICountResult>,
    db.collection('specialists').where({ status: 'active' }).count() as Promise<ICountResult>,
    db.collection('measurements').count() as Promise<ICountResult>
  ]);

  return {
    success: true as const,
    data: {
      users: usersResult.total,
      specialists: specialistsResult.total,
      measurements: measurementsResult.total,
      updatedAt: new Date()
    }
  };
}

async function handleMonitor(openId: string): Promise<ApiResponse<any>> {
  try {
    const result = await db.collection('admins')
      .where({
        _openid: openId,
        status: 'active'
      })
      .get() as IQueryResult;

    const admins = result.data;

    if (!admins.length) {
      throw new AppError(ErrorCode.UNAUTHORIZED, '无权限访问监控数据');
    }

    const status = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      timestamp: new Date().toISOString()
    };

    await db.collection('system_status').add({
      data: status
    });

    return {
      success: true as const,
      data: status
    };
  } catch (error) {
    const appError = AppError.fromError(error);
    return {
      success: false as const,
      error: {
        code: appError.code,
        message: appError.message
      }
    };
  }
}

async function handleFeedback(openId: string, feedback?: { content: string; type: string; images?: string[] }): Promise<ApiResponse<any>> {
  if (!feedback?.content) {
    throw new AppError(ErrorCode.INVALID_PARAMS, '反馈内容不能为空');
  }

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

  const addResult = await db.collection('feedbacks').add({
    data: {
      userId: users[0]._id,
      content: feedback.content,
      type: feedback.type || 'general',
      images: feedback.images || [],
      status: 'pending',
      createdAt: new Date()
    }
  }) as IAddResult;

  return {
    success: true as const,
    data: { _id: addResult._id }
  };
}