import * as cloud from 'wx-server-sdk';
import { ApiResponse } from '../../../common/types/api';
import { ErrorCode, AppError } from '../../../common/types/error';
import { IAddResult, IQueryResult } from '../../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

export interface AuditLogParams {
  action: 'login' | 'measurement' | 'subscription' | 'renewal' | 'device_bind' | 'alert';
  userId: string;
  details?: any;
}

export interface GetLogsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
}

export async function createLog(params: AuditLogParams): Promise<ApiResponse> {
  try {
    if (!params.userId || !params.action) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '缺少必要参数');
    }

    const result = await db.collection('audit_logs').add({
      data: {
        ...params,
        createdAt: new Date()
      }
    }) as IAddResult;

    return {
      success: true as const,
      data: {
        logId: result._id
      }
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

export async function getLogs(params: GetLogsParams): Promise<ApiResponse> {
  try {
    if (!params.userId) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '缺少用户ID');
    }

    if (params.page !== undefined && (params.page < 1 || params.page > 1000)) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '无效的分页参数');
    }

    if (params.pageSize !== undefined && (params.pageSize < 1 || params.pageSize > 100)) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '无效的分页参数');
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    const query: { userId: string; action?: string } = {
      userId: params.userId
    };

    if (params.action) {
      query.action = params.action;
    }

    const logs = await db.collection('audit_logs')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get() as IQueryResult;

    return {
      success: true as const,
      data: logs.data
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