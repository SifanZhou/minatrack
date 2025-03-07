/**
 * 专家端统计数据服务
 */
const api = require('../api');
const storage = require('../storage');

// 缓存键名
const CACHE_KEYS = {
  STATS: 'specialist_stats',
  LAST_UPDATE: 'specialist_stats_last_update'
};

// 缓存过期时间（毫秒）
const CACHE_EXPIRE = 10 * 60 * 1000; // 10分钟

const statsService = {
  /**
   * 计算客户统计数据
   * @param {Array} clients 客户列表
   * @returns {Promise} 统计数据
   */
  calculateStats: async function(clients) {
    return new Promise((resolve) => {
      const now = new Date();
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      const stats = {
        totalClients: clients.length,
        activeClients: clients.filter(c => {
          if (!c.lastCheck || c.lastCheck === '暂无数据') return false;
          // 简化判断逻辑，只要不是"周前"或"个月前"就认为是活跃的
          return !c.lastCheck.includes('周前') && !c.lastCheck.includes('个月前');
        }).length,
        warningClients: clients.filter(c => c.status === 'warning').length,
        dangerClients: clients.filter(c => c.status === 'danger').length,
        recentMeasurements: clients
          .filter(c => c.lastCheck && c.lastCheck !== '暂无数据')
          .sort((a, b) => {
            // 简单排序，优先显示"刚刚"、"分钟前"、"今天"的记录
            const aValue = this.getTimeValue(a.lastCheck);
            const bValue = this.getTimeValue(b.lastCheck);
            return aValue - bValue;
          })
          .slice(0, 5)
      };
      
      resolve(stats);
    });
  },

  /**
   * 获取时间值用于排序（越近的时间值越小）
   */
  getTimeValue: function(timeStr) {
    if (timeStr.includes('刚刚')) return 0;
    if (timeStr.includes('分钟前')) return 1;
    if (timeStr.includes('今天')) return 2;
    if (timeStr.includes('昨天')) return 3;
    if (timeStr.includes('前天')) return 4;
    return 5; // 默认值，确保函数总是返回一个值
  },
    
  /**
   * 获取统计数据
   * @param {Boolean} forceRefresh 是否强制刷新
   * @returns {Promise} 统计数据
   */
  getStats: async function(forceRefresh = false) {
    try {
      // 检查缓存是否可用
      if (!forceRefresh) {
        const lastUpdate = storage.get(CACHE_KEYS.LAST_UPDATE);
        const cachedStats = storage.get(CACHE_KEYS.STATS);
        
        if (cachedStats && lastUpdate && (Date.now() - lastUpdate < CACHE_EXPIRE)) {
          console.log('使用缓存的统计数据');
          return cachedStats;
        }
      }
      
      // 调用云函数获取统计数据
      const result = await api.callFunction('specialist', {
        action: 'stats'
      });
      
      // 更新缓存
      storage.set(CACHE_KEYS.STATS, result);
      storage.set(CACHE_KEYS.LAST_UPDATE, Date.now());
      
      return result;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 如果有缓存，返回缓存数据
      const cachedStats = storage.get(CACHE_KEYS.STATS);
      if (cachedStats) {
        return cachedStats;
      }
      
      // 如果没有缓存，尝试从客户列表计算
      const clientService = require('./client');
      try {
        const clients = await clientService.getClientList();
        const stats = await this.calculateStats(clients);
        return stats;
      } catch (err) {
        console.error('计算统计数据失败:', err);
        throw error;
      }
    }
  },
  
  /**
   * 清除统计数据缓存
   */
  clearCache: function() {
    storage.remove(CACHE_KEYS.STATS);
    storage.remove(CACHE_KEYS.LAST_UPDATE);
  }
};

module.exports = statsService;