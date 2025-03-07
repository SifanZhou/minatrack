/**
 * 数据同步服务
 * 处理本地数据与云端的同步
 */
import StorageService from './storage';

// 确保云环境已初始化
const ensureCloudInit = () => {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    return false;
  }
  return true;
};

const SyncService = {
  // 同步用户信息
  syncUserProfile: async function() {
    if (!ensureCloudInit()) return null;
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'profile'
        }
      });
      
      if (res.result.success) {
        StorageService.setUserProfile(res.result.data);
        return res.result.data;
      }
      return null;
    } catch (error) {
      console.error('同步用户信息失败:', error);
      return null;
    }
  },
  
  // 同步测量记录
  syncMeasurements: async function(force = false) {
    // 如果缓存未过期且不强制刷新，则使用缓存
    if (!force && !StorageService.isMeasurementListExpired()) {
      return StorageService.getMeasurementList();
    }
    
    if (!ensureCloudInit()) return StorageService.getMeasurementList();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'measurements',
          query: {
            limit: 20,
            offset: 0
          }
        }
      });
      
      if (res.result.success) {
        StorageService.setMeasurementList(res.result.data);
        return res.result.data;
      }
      return [];
    } catch (error) {
      console.error('同步测量记录失败:', error);
      // 如果同步失败但有缓存，返回缓存
      return StorageService.getMeasurementList();
    }
  },
  
  // 上传新的测量数据
  uploadMeasurement: async function(data) {
    if (!ensureCloudInit()) return null;
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'measurement',
          data: data
        }
      });
      
      if (res.result.success) {
        // 更新最近一次测量记录
        StorageService.setLastMeasurement(res.result.data);
        // 清除列表缓存，强制下次刷新
        StorageService.setMeasurementList([]);
        return res.result.data;
      }
      return null;
    } catch (error) {
      console.error('上传测量数据失败:', error);
      return null;
    }
  }
};

export default SyncService;