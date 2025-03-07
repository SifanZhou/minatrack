/**
 * 数据存储服务 - 处理数据缓存和同步
 */
const storage = {
  // 缓存键名定义
  keys: {
    USER_INFO: 'userInfo',
    MEASUREMENTS: 'measurements',
    LAST_SYNC: 'lastSync',
    SETTINGS: 'settings'
  },

  /**
   * 获取缓存数据
   */
  get: function(key) {
    try {
      return wx.getStorageSync(key);
    } catch (err) {
      console.error('读取缓存失败:', err);
      return null;
    }
  },

  /**
   * 设置缓存数据
   */
  set: function(key, data) {
    try {
      wx.setStorageSync(key, data);
      return true;
    } catch (err) {
      console.error('写入缓存失败:', err);
      return false;
    }
  },

  /**
   * 同步测量数据
   */
  syncMeasurements: function() {
    return new Promise((resolve, reject) => {
      const lastSync = this.get(this.keys.LAST_SYNC) || 0;
      const now = Date.now();

      // 获取上次同步后的新数据
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getMeasurements',
          data: {
            lastSync
          }
        }
      }).then(res => {
        if (res.result && res.result.data) {
          // 合并本地数据
          const localData = this.get(this.keys.MEASUREMENTS) || [];
          const newData = this.mergeMeasurements(localData, res.result.data);
          
          // 更新缓存
          this.set(this.keys.MEASUREMENTS, newData);
          this.set(this.keys.LAST_SYNC, now);
          
          resolve(newData);
        }
      }).catch(reject);
    });
  },

  /**
   * 合并测量数据，确保不重复
   */
  mergeMeasurements: function(local, remote) {
    const merged = [...local];
    const ids = new Set(local.map(item => item._id));
    
    remote.forEach(item => {
      if (!ids.has(item._id)) {
        merged.push(item);
        ids.add(item._id);
      }
    });
    
    return merged.sort((a, b) => b.createdAt - a.createdAt);
  },

  /**
   * 保存新的测量数据
   */
  saveMeasurement: function(data) {
    return new Promise((resolve, reject) => {
      // 检查云函数环境是否初始化
      if (!wx.cloud) {
        console.error('云开发环境未初始化');
        resolve(data); // 返回原始数据，避免报错
        return;
      }
      
      // 先保存到本地
      const measurements = this.get(this.keys.MEASUREMENTS) || [];
      measurements.unshift({
        ...data,
        _id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        pending: true
      });
      
      this.set(this.keys.MEASUREMENTS, measurements);

      // 然后同步到服务器
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'measurement',
          data
        }
      }).then(res => {
        if (res.result && res.result.data) {
          // 更新本地数据的ID和状态
          const updatedMeasurements = measurements.map(item => {
            if (item.pending) {
              return {
                ...res.result.data,
                pending: false
              };
            }
            return item;
          });
          
          this.set(this.keys.MEASUREMENTS, updatedMeasurements);
          resolve(res.result.data);
        }
      }).catch(err => {
        console.error('同步测量数据失败:', err);
        // 失败时也返回原始数据，确保本地流程不中断
        resolve(data);
      });
    });
  },

  /**
   * 清理过期缓存数据
   */
  cleanup: function() {
    const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7天
    const now = Date.now();
    
    Object.keys(this.keys).forEach(key => {
      const data = this.get(key);
      if (data && data.timestamp && (now - data.timestamp > MAX_CACHE_AGE)) {
        wx.removeStorageSync(key);
      }
    });
  }
};

module.exports = storage;