/**
 * API服务
 */
const errorHandler = require('./error');

/**
 * 调用云函数
 * @param {string} name 云函数名称
 * @param {object} data 参数
 * @returns {Promise} Promise对象
 */
function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        try {
          if (!res || typeof res !== 'object') {
            reject('无效的返回结果');
            return;
          }
          
          if (!res.result || typeof res.result !== 'object') {
            reject('无效的返回结果格式');
            return;
          }
          
          // 兼容不同的返回格式
          if (res.result.success === false) {
            reject(res.result.error || '操作失败');
            return;
          }
          
          // 如果 result 就是数据本身，或者数据在 result.data 中
          const resultData = res.result.hasOwnProperty('data') ? res.result.data : res.result;
          resolve(resultData);
        } catch (err) {
          console.error('处理云函数返回数据失败:', err);
          reject('处理返回数据时发生错误');
        }
      },
      fail: (err) => {
        console.error(`调用云函数 ${name} 失败:`, err);
        reject({
          code: 'NETWORK_ERROR',
          message: '网络错误，请重试'
        });
      }
    });
  });
}

/**
 * 用户相关API
 */
const user = {
  /**
   * 用户登录
   * @returns {Promise} Promise对象
   */
  login(userInfo) {
    return callFunction('user', { 
      action: 'login',
      userInfo
    });
  },
  
  /**
   * 更新用户资料
   * @param {object} profile 用户资料
   * @returns {Promise} Promise对象
   */
  updateProfile(profile) {
    return callFunction('user', { 
      action: 'profile',
      profile
    });
  },
  
  /**
   * 获取用户测量记录
   * @param {object} query 查询参数
   * @returns {Promise} Promise对象
   */
  getMeasurements(query = {}) {
    return callFunction('user', {
      action: 'measurements',
      query
    });
  },
  
  /**
   * 获取单条测量记录
   * @param {string} measurementId 测量记录ID
   * @returns {Promise} Promise对象
   */
  getMeasurement(measurementId) {
    return callFunction('user', {
      action: 'measurement',
      measurementId
    });
  },
  
  /**
   * 获取用户信息
   * @returns {Promise} Promise对象
   */
  getUserInfo() {
    return callFunction('user', {
      action: 'profile'  // 使用已存在的 profile action
    });
  }
};

/**
 * 设备相关API
 */
const device = {
  /**
   * 连接设备
   * @param {string} deviceId 设备ID
   * @param {string} name 设备名称
   * @returns {Promise} Promise对象
   */
  connect(deviceId, name) {
    return callFunction('device', {
      action: 'connect',
      data: { deviceId, name }
    });
  },
  
  /**
   * 同步设备数据
   * @param {object} syncData 同步数据
   * @returns {Promise} Promise对象
   */
  sync(syncData) {
    return callFunction('device', {
      action: 'sync',
      syncData
    });
  },
  
  /**
   * 处理设备原始数据
   * @param {string} deviceId 设备ID
   * @param {ArrayBuffer} rawData 原始数据
   * @returns {Promise} Promise对象
   */
  processData(deviceId, rawData) {
    return callFunction('device', {
      action: 'process',
      data: { deviceId, rawData }
    });
  }
};

module.exports = {
  user,
  device,
  callFunction
};