/**
 * 专家端客户数据服务
 */
const api = require('../api');
const storage = require('../storage');

// 缓存键名
const CACHE_KEYS = {
  CLIENT_LIST: 'specialist_client_list',
  CLIENT_DETAIL: 'specialist_client_detail_',
  LAST_UPDATE: 'specialist_client_last_update'
};

// 缓存过期时间（毫秒）
const CACHE_EXPIRE = {
  CLIENT_LIST: 5 * 60 * 1000, // 5分钟
  CLIENT_DETAIL: 10 * 60 * 1000 // 10分钟
};

const clientService = {
  /**
   * 获取客户列表
   * @param {Object} params 查询参数
   * @param {Boolean} forceRefresh 是否强制刷新
   * @returns {Promise} 客户列表
   */
  getClientList: async function(params = { status: 'active' }, forceRefresh = false) {
    try {
      // 检查缓存是否可用
      if (!forceRefresh) {
        const lastUpdate = storage.get(CACHE_KEYS.LAST_UPDATE);
        const cachedClients = storage.get(CACHE_KEYS.CLIENT_LIST);
        
        if (cachedClients && lastUpdate && (Date.now() - lastUpdate < CACHE_EXPIRE.CLIENT_LIST)) {
          console.log('使用缓存的客户列表数据');
          return cachedClients;
        }
      }
      
      // 修改云函数调用参数，使用云函数支持的action名称
      const result = await api.callFunction('specialist', {
        action: 'list', // 修改为云函数支持的action名称
        params
      });
      
      // 处理客户数据
      const data = result && result.data ? result.data : [];
      const clients = this.formatClientData(data);
      
      // 如果没有数据，返回测试数据
      if (clients.length === 0) {
        console.log('没有真实客户数据，使用测试数据');
        return this.getTestClients();
      }
      
      // 更新缓存
      storage.set(CACHE_KEYS.CLIENT_LIST, clients);
      storage.set(CACHE_KEYS.LAST_UPDATE, Date.now());
      
      return clients;
    } catch (error) {
      console.error('获取客户列表失败:', error);
      // 如果有缓存，返回缓存数据
      const cachedClients = storage.get(CACHE_KEYS.CLIENT_LIST);
      if (cachedClients) {
        return cachedClients;
      }
      // 返回测试数据作为后备
      return this.getTestClients();
    }
  },
  
  /**
   * 获取客户详情
   * @param {String} clientId 客户ID
   * @param {Boolean} forceRefresh 是否强制刷新
   * @returns {Promise} 客户详情
   */
  getClientDetail: async function(clientId, forceRefresh = false) {
    try {
      const cacheKey = CACHE_KEYS.CLIENT_DETAIL + clientId;
      
      // 检查缓存是否可用
      if (!forceRefresh) {
        const cachedDetail = storage.get(cacheKey);
        if (cachedDetail && cachedDetail.lastUpdate && 
            (Date.now() - cachedDetail.lastUpdate < CACHE_EXPIRE.CLIENT_DETAIL)) {
          return cachedDetail.data;
        }
      }
      
      // 获取测试数据
      const testClients = this.getTestClients();
      const testClient = testClients.find(client => client.id.toString() === clientId.toString());
      
      if (testClient) {
        // 构造测试详情数据
        const testDetail = {
          ...testClient,
          measurements: [
            {
              measureTime: '2024-03-06T10:00:00.000Z',
              weight: 65.5,
              bodyFat: 22.1
            },
            {
              measureTime: '2024-03-05T10:00:00.000Z',
              weight: 65.8,
              bodyFat: 22.3
            },
            {
              measureTime: '2024-03-04T10:00:00.000Z',
              weight: 66.0,
              bodyFat: 22.5
            }
          ]
        };
        
        // 更新缓存
        storage.set(cacheKey, {
          data: testDetail,
          lastUpdate: Date.now()
        });
        
        return testDetail;
      }
      
      // 如果找不到测试数据，再尝试调用云函数
      const result = await api.callFunction('specialist', {
        action: 'list',
        params: {
          type: 'detail',
          clientId: clientId
        }
      });
      
      storage.set(cacheKey, {
        data: result,
        lastUpdate: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('获取客户详情失败:', error);
      throw error;
    }
  },
  
  /**
   * 格式化客户数据
   * @param {Array} data 原始数据
   * @returns {Array} 格式化后的数据
   */
  formatClientData: function(data) {
    const statusService = require('../utils/status');
    const timeUtil = require('../utils/time');
    
    return data.map(item => {
      // 安全获取用户数据
      const user = item.user || {};
      const lastMeasurement = user.lastMeasurement ? user.lastMeasurement : null;
      
      return {
        id: item.userId || '',
        name: (user && user.nickName) || '未知用户',
        avatar: (user && user.avatarUrl) || '',
        lastCheck: timeUtil.getRelativeTime(lastMeasurement) || '暂无数据',
        status: statusService.calculateClientStatus(user || {}),
        gender: user.gender || '',
        age: user.age || 0,
        height: user.height || 0
      };
    });
  },
  
  /**
   * 获取测试客户数据
   * @returns {Array} 测试客户数据
   */
  getTestClients: function() {
    const timeUtil = require('../utils/time');
    
    const testClients = [
      {
        id: 1,
        name: '张三',
        gender: '男',
        age: 25,
        height: 175,
        lastCheck: timeUtil.getRelativeTime('2024-03-04'),
        status: 'normal',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      {
        id: 2,
        name: '李四',
        gender: '女',
        age: 30,
        height: 165,
        lastCheck: timeUtil.getRelativeTime('2024-03-01'),
        status: 'warning',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      {
        id: 3,
        name: '王五',
        gender: '男',
        age: 45,
        height: 180,
        lastCheck: timeUtil.getRelativeTime('2024-02-26'),
        status: 'danger',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      }
    ];
    
    return testClients;
  },
  
  /**
   * 添加测试客户
   * @returns {Object} 新添加的测试客户
   */
  addTestClient: function() {
    const timeUtil = require('../utils/time');
    
    // 获取当前客户列表
    const clients = storage.get(CACHE_KEYS.CLIENT_LIST) || this.getTestClients();
    
    // 创建新的测试客户
    const newClient = {
      id: clients.length + 1,
      name: `测试客户${clients.length + 1}`,
      gender: Math.random() > 0.5 ? '男' : '女',
      age: Math.floor(Math.random() * 40) + 20,
      height: Math.floor(Math.random() * 30) + 160,
      lastCheck: timeUtil.getRelativeTime(new Date().toISOString()),
      status: ['normal', 'warning', 'danger'][Math.floor(Math.random() * 3)],
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    };
    
    // 添加到列表并更新缓存
    const updatedClients = [...clients, newClient];
    storage.set(CACHE_KEYS.CLIENT_LIST, updatedClients);
    storage.set(CACHE_KEYS.LAST_UPDATE, Date.now());
    
    return {
      newClient,
      clients: updatedClients
    };
  },
  
  /**
   * 清除客户数据缓存
   */
  clearCache: function() {
    storage.remove(CACHE_KEYS.CLIENT_LIST);
    storage.remove(CACHE_KEYS.LAST_UPDATE);
    // 清除所有客户详情缓存
    try {
      // 使用异步API替代已弃用的同步API
      wx.getStorageInfo({
        success: (res) => {
          const allKeys = res.keys;
          allKeys.forEach(key => {
            if (key.startsWith(CACHE_KEYS.CLIENT_DETAIL)) {
              storage.remove(key);
            }
          });
        },
        fail: (err) => {
          console.error('获取存储信息失败:', err);
        }
      });
    } catch (error) {
      console.error('清除客户详情缓存失败:', error);
    }
  }
};

module.exports = clientService;