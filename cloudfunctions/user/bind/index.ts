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
    // 检查用户是否已经绑定了专家
    const existingBinding = await db.collection('bindings')
      .where({
        userId: OPENID,
        status: 'active'
      })
      .get() as IQueryResult;
    
    // 如果已经绑定了专家，先检查是否是同一个邀请码
    if (existingBinding.data && existingBinding.data.length > 0) {
      // 查询当前邀请码对应的专家
      const inviteInfo = await db.collection('invites')
        .where({
          inviteCode,
          status: 'active'
        })
        .get() as IQueryResult;
      
      if (inviteInfo.data && inviteInfo.data.length > 0) {
        // 如果是同一个专家，返回已绑定信息
        if (inviteInfo.data[0].specialistId === existingBinding.data[0].specialistId) {
          return {
            success: true,
            data: existingBinding.data[0],
            message: '您已绑定该管理师'
          };
        } else {
          // 如果是不同专家，先解除原有绑定
          await db.collection('bindings').doc(existingBinding.data[0]._id).update({
            data: {
              status: 'inactive',
              updatedAt: new Date()
            }
          });
        }
      }
    }

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
        createdAt: new Date(),
        inviteCode: inviteCode
      }
    });
    
    // 获取专家信息，用于返回
    const specialistInfo = await db.collection('specialists')
      .doc(inviteResult.data[0].specialistId)
      .get();

    return {
      success: true,
      data: {
        binding: bindingResult,
        specialist: specialistInfo.data
      },
      message: '绑定成功'
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.INTERNAL_ERROR, '绑定失败');
  }
};