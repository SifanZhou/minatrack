import * as cloud from 'wx-server-sdk';

const db = cloud.database();

interface DBUser {
  _id: string;
  status: string;
}

interface DBQueryResult<T> {
  data: T[];
  errMsg?: string;
}

export interface ReportGenerationParams {
  dryRun?: boolean;
}

export interface ReportGenerationResult {
  success: boolean;
  generated?: number;
  error?: string;
}

export const main = async (event: ReportGenerationParams): Promise<ReportGenerationResult> => {
  const { dryRun = false } = event;

  try {
    // 获取需要生成报告的用户
    const usersQuery = await db.collection('users')
      .where({
        status: 'active'
      })
      .get();
    const users = usersQuery as unknown as Promise<DBQueryResult<DBUser>>;

    const userList = (await users).data;

    if (dryRun) {
      return {
        success: true,
        generated: userList.length
      };
    }

    // 为每个用户生成报告
    for (const user of userList) {
      const report = {
        userId: user._id,
        type: 'weekly',
        data: {
          measurements: [],
          analysis: {},
          recommendations: []
        },
        createdAt: new Date()
      };

      await db.collection('reports').add({
        data: report
      });
    }

    return {
      success: true,
      generated: userList.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '报告生成失败'
    };
  }
};