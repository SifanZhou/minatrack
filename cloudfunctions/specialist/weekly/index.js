// 云函数入口文件
const cloud = require('wx-server-sdk');

// 明确指定云环境ID
cloud.init({
  env: 'minatrack-0gee1z7vf57df583'  // 修改为正确的环境ID
});
const db = cloud.database();

// 云函数入口函数
exports.main = async (event) => {
  const { specialistId } = event;
  const _ = db.command;

  try {
    // 获取该专家下的所有用户
    const bindings = await db.collection('subscriptions')
      .where({
        specialistId,
        status: 'active'
      })
      .get();

    const userIds = bindings && bindings.data ? bindings.data.map(binding => binding.userId) : [];

    // 获取所有用户的最新测量数据
    const measurements = await db.collection('measurements')
      .where({
        userId: _.in(userIds)
      })
      .orderBy('measuredAt', 'desc')
      .get();

    // 即使没有测量数据，也使用实际的用户总数
    const totalUsers = userIds.length;

    // 如果没有用户，返回空报告
    if (!userIds.length) {
      const emptyReport = {
        specialistId,
        generatedAt: new Date(),
        weightDistribution: {
          totalUsers: userIds.length,
          weightRanges: {
            underweight: 0,
            normal: 0,
            overweight: 0,
            obese: 0
          }
        },
        riskWarning: {
          abnormalIncrease: {
            count: 0,
            users: []
          }
        }
      };

      // 保存空报告到数据库
      try {
        await db.collection('specialist_reports').add({
          data: emptyReport
        });
      } catch (err) {
        console.error('保存空报告失败:', err);
      }

      return {
        success: true,
        report: emptyReport
      };
    }

    // 计算体重分布
    const weightDistribution = {
      totalUsers: userIds.length,
      weightRanges: {
        underweight: 0,
        normal: 0,
        overweight: 0,
        obese: 0
      }
    };

    // 计算异常增长警告
    const riskWarning = {
      abnormalIncrease: {
        count: 0,
        users: []
      }
    };

    // 分析每个用户的数据
    const userLatestData = new Map();
    measurements.data.forEach(measurement => {
      if (!userLatestData.has(measurement.userId)) {
        userLatestData.set(measurement.userId, measurement);

        // 确保metrics对象存在
        if (measurement.metrics) {
          // 计算BMI分布
          const bmi = measurement.metrics.weight / Math.pow(measurement.metrics.height / 100, 2);
          if (bmi < 18.5) weightDistribution.weightRanges.underweight++;
          else if (bmi < 24) weightDistribution.weightRanges.normal++;
          else if (bmi < 28) weightDistribution.weightRanges.overweight++;
          else weightDistribution.weightRanges.obese++;

          // 检查异常增长
          if (measurement.metrics.weightChange && measurement.metrics.weightChange > 2) {
            riskWarning.abnormalIncrease.count++;
            riskWarning.abnormalIncrease.users.push({
              userId: measurement.userId,
              name: measurement.userName || '未知用户',
              weightChange: measurement.metrics.weightChange
            });
          }
        }
      }
    });

    const report = {
      specialistId,
      generatedAt: new Date(),
      weightDistribution,
      riskWarning
    };

    // 保存报告到数据库
    const result = await db.collection('specialist_reports').add({
      data: report
    });

    // 检查数据库操作结果
    if (!result || (typeof result === 'object' && !result._id)) {
      throw new Error('报告保存失败');
    }

    return {
      success: true,
      report
    };
  } catch (error) {
    // 即使在错误情况下也返回一个空的报告对象
    const emptyReport = {
      specialistId,
      generatedAt: new Date(),
      weightDistribution: {
        totalUsers: 0,
        weightRanges: {
          underweight: 0,
          normal: 0,
          overweight: 0,
          obese: 0
        }
      },
      riskWarning: {
        abnormalIncrease: {
          count: 0,
          users: []
        }
      }
    };

    // 保存空报告到数据库
    await db.collection('specialist_reports').add({
      data: emptyReport
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : '专家周报生成失败',
      report: emptyReport
    };
  }
};