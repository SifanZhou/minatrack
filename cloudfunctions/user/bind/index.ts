import * as cloud from 'wx-server-sdk';
import { ApiResponse } from '../../../common/types/api';
import { ErrorCode, AppError } from '../../../common/types/error';
import { IQueryResult } from '../../../common/types/wx-server-sdk';

cloud.init();
const db = cloud.database();

export const main = async (event: { inviteCode: string }): Promise<ApiResponse> => {
  const { OPENID } = cloud.getWXContext();
  const { inviteCode } = event;
  
  try {
    // 验证邀请码
    const inviteResult = await db.collection('invites')
      .where({
        inviteCode,
        status: 'active'
      })
      .get() as IQueryResult;

    if (!inviteResult.data || inviteResult.data.length === 0) {
      throw new AppError(ErrorCode.INVALID_PARAMS, '无效的邀请码');
    }

    // 更新邀请码状态
    await db.collection('invites').doc(inviteResult.data[0]._id).update({
      data: {
        status: 'used',
        usedBy: OPENID,
        usedAt: new Date()
      }
    });

    // 创建绑定关系
    const bindingResult = await db.collection('bindings').add({
      data: {
        userId: OPENID,
        specialistId: inviteResult.data[0].specialistId,
        status: 'active',
        createdAt: new Date()
      }
    });

    return {
      success: true,
      data: bindingResult
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.INTERNAL_ERROR, '绑定失败');
  }
};