import { nanoid } from 'nanoid';
import { Invite, InviteResult } from '../../../../common/types/invite';

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

export const main = async (): Promise<InviteResult> => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 验证管理师状态
    const specialist = await db.collection('specialists')
      .where({ _openid: OPENID, status: 'active' })
      .get();

    if (!specialist.data.length) {
      throw new Error('无效的管理师账号');
    }

    // 生成邀请码
    const inviteCode = nanoid(8);
    const invite: Invite = {
      specialistId: OPENID,
      inviteCode,
      status: 'pending',
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天有效期
    };

    await db.collection('invites').add({
      data: invite
    });

    const inviteLink = `${process.env.APP_BASE_URL}/bind?code=${inviteCode}`;

    return {
      success: true,
      inviteLink
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '邀请创建失败'
    };
  }
};