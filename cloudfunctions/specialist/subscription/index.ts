import { Subscription, SubscriptionParams, SubscriptionResult } from '../../../../common/types/subscription';

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

export const main = async (event: SubscriptionParams): Promise<SubscriptionResult> => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { specialistId, months, autoRenew } = event;

    // 参数验证
    if (!specialistId || !months || months <= 0) {
      return {
        success: false,
        error: '无效的订阅参数'
      };
    }

    // 检查是否已有活跃订阅
    const existingSubscription = await db.collection('subscriptions')
      .where({
        userId: OPENID,
        specialistId,
        status: 'active'
      })
      .get();

    if (existingSubscription.data?.length > 0) {
      return {
        success: false,
        error: '已存在活跃订阅'
      };
    }

    // 获取专家信息
    const specialist = await db.collection('specialists')
      .doc(specialistId)
      .get();

    if (!specialist.data) {
      return {
        success: false,
        error: '未找到指定管理师'
      };
    }

    const price = specialist.data.servicePrice * months;

    // 创建订阅记录
    const subscription: Subscription = {
      specialistId,
      userId: OPENID,
      price,
      months,
      startDate: new Date(),
      endDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      autoRenew: autoRenew || false
    };

    const result = await db.collection('subscriptions').add({
      data: subscription
    });

    if (!result._id) {
      throw new Error('创建订阅记录失败');
    }

    // 调用支付接口
    const payment = await cloud.callFunction({
      name: 'wxpay',
      data: {
        body: `${specialist.data.name || '管理师'}服务订阅`,
        outTradeNo: result._id,
        totalFee: price,
        attach: JSON.stringify({ 
          type: 'subscription',
          specialistId,
          months 
        })
      }
    });

    return {
      success: true,
      subscription: {
        ...subscription,
        _id: result._id
      },
      paymentInfo: payment.result
    };

  } catch (error) {
    console.error('创建订阅失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建订阅失败'
    };
  }
};