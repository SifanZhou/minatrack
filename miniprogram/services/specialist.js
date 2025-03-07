// 专家端数据分析服务
const api = require('./api');
const storage = require('./storage');

const specialistService = {
  // 获取本周客户体重变化分布
  getWeightChangeDistribution: async function() {
    try {
      // 调用云函数获取所有客户的本周数据
      const result = await wx.cloud.callFunction({
        name: 'specialist',
        data: {
          type: 'getWeightChangeDistribution'
        }
      });
      
      console.log('获取体重变化分布数据:', result);
      
      if (result && result.result) {
        return result.result;
      }
      
      // 如果云函数未实现，返回模拟数据
      return {
        decrease: 15,      // 下降明显（达到黄金目标）
        slightDecrease: 22, // 轻微下降（需加码跟进）
        stable: 33,        // 持平（存在潜在风险）
        increase: 13,      // 上升（需紧急干预）
        abnormal: 3,       // 数据异常上升（>1%）
        noUpdate: 7        // 未更新数据（超过3天）
      };
    } catch (error) {
      console.error('获取体重变化分布失败:', error);
      // 出错时返回默认数据
      return {
        decrease: 0,
        slightDecrease: 0,
        stable: 0,
        increase: 0,
        abnormal: 0,
        noUpdate: 0
      };
    }
  },
  
  // 获取客户活跃度分布
  getClientActivityDistribution: async function() {
    try {
      // 调用云函数获取客户活跃度数据
      const result = await wx.cloud.callFunction({
        name: 'specialist',
        data: {
          type: 'getClientActivityDistribution'
        }
      });
      
      console.log('获取客户活跃度分布数据:', result);
      
      if (result && result.result) {
        return result.result;
      }
      
      // 如果云函数未实现，返回模拟数据
      return {
        active: 25,     // 活跃（本周有3次以上测量）
        normal: 35,     // 正常（本周有1-2次测量）
        inactive: 15,   // 不活跃（本周无测量但两周内有）
        dormant: 10     // 休眠（超过两周无测量）
      };
    } catch (error) {
      console.error('获取客户活跃度分布失败:', error);
      // 出错时返回默认数据
      return {
        active: 0,
        normal: 0,
        inactive: 0,
        dormant: 0
      };
    }
  },
  
  // 获取特定类型的客户列表
  getClientsByCategory: async function(category, type) {
    try {
      // 调用云函数获取特定类型的客户列表
      const result = await wx.cloud.callFunction({
        name: 'specialist',
        data: {
          type: 'getClientsByCategory',
          data: {
            category,
            type
          }
        }
      });
      
      console.log(`获取${category}类型的${type}客户列表:`, result);
      
      if (result && result.result && result.result.clients) {
        return result.result.clients;
      }
      
      // 如果云函数未实现，返回模拟数据
      return [
        {
          id: '1',
          name: '张三',
          avatar: '',
          change: category === 'weight' ? (type === 'decrease' ? -0.8 : type === 'increase' ? 0.5 : 0) : null,
          lastUpdate: category === 'activity' && type === 'noUpdate' ? '3天前' : '今天'
        },
        {
          id: '2',
          name: '李四',
          avatar: '',
          change: category === 'weight' ? (type === 'decrease' ? -0.5 : type === 'increase' ? 0.3 : 0) : null,
          lastUpdate: category === 'activity' && type === 'noUpdate' ? '4天前' : '昨天'
        }
      ];
    } catch (error) {
      console.error(`获取${category}类型的${type}客户列表失败:`, error);
      return [];
    }
  }
};

module.exports = specialistService;