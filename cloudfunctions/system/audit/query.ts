import { AuditQuery } from '../../../../common/types/audit';

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

export const main = async (event: AuditQuery) => {
  const { userId, limit = 10, offset = 0 } = event;

  try {
    // 参数验证
    if (!userId || limit < 0 || offset < 0) {
      return {
        success: false,
        error: '无效的查询参数'
      };
    }

    // 获取总数
    const countResult = await db.collection('audit_logs')
      .where({ userId })
      .count();

    // 查询日志
    const logsResult = await db.collection('audit_logs')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(limit)
      .get();

    return {
      success: true,
      logs: logsResult.data,
      total: countResult.total
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '日志查询失败'
    };
  }
};

export const getLogs = main;