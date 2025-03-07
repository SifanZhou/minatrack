import * as cloud from 'wx-server-sdk';
// 定义查询结果接口
// 定义查询结果接口类型
interface IQueryResult<T> {
  data: T[];
  errMsg?: string;
}

interface Subscription {
  _id: string;
  status: string;
  endDate: Date;
  updatedAt?: Date;
}

const db = cloud.database();

export interface RenewalParams {
  dryRun?: boolean;
  endDate?: Date;
}

export interface RenewalResult {
  success: boolean;
  processed?: number;
  error?: string;
}

export const main = async (event: RenewalParams): Promise<RenewalResult> => {
  const { dryRun = false } = event;

  try {
    // 查找即将到期的订阅
    const subscriptions = (await db.collection('subscriptions')
      .where({
        status: 'active',
        endDate: db.command.lte(new Date())
      })
      .get()) as IQueryResult<Subscription>;

    if (dryRun) {
      return {
        success: true,
        processed: subscriptions.data.length
      };
    }

    // 处理每个订阅
    for (const subscription of subscriptions.data) {
      await db.collection('subscriptions')
        .where({
          _id: subscription._id
        })
        .update({
          data: {
            status: 'expired',
            updatedAt: new Date()
          }
        });
    }

    return {
      success: true,
      processed: subscriptions.data.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '订阅续费处理失败'
    };
  }
};