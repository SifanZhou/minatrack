// 测量相关服务
const api = require('./api');
const storage = require('./storage');
const LOCAL_MEASUREMENTS_KEY = 'local_measurements';

const measureService = {
  // 同步本地测量数据
  syncLocalMeasurements: function(page) {
    return new Promise((resolve, reject) => {
      try {
        const localData = wx.getStorageSync(LOCAL_MEASUREMENTS_KEY);
        if (!localData || !localData.length) {
          console.log('没有需要同步的本地数据');
          resolve();
          return;
        }
  
        // 获取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
          console.log('同步暂时跳过，将在下次启动时重试');
          resolve();
          return;
        }
  
        // 上传本地数据到云端
        Promise.all(localData.map(measurement => {
          return wx.cloud.callFunction({
            name: 'user',
            data: {
              type: 'addMeasurement',
              data: {
                weight: measurement.weight,
                bodyFat: 20.1,  // 模拟数据
                muscle: 54.2,   // 模拟数据
                water: 65.0,    // 模拟数据
                bone: 3.1,      // 模拟数据
                bmi: 22.5,      // 模拟数据
                measuredAt: measurement.measuredAt
              }
            }
          });
        }))
        .then(() => {
          // 清除已同步的本地数据
          wx.removeStorageSync(LOCAL_MEASUREMENTS_KEY);
          console.log('本地数据同步完成');
          resolve();
        })
        .catch(error => {
          console.error('同步失败:', error);
          reject(error);
        });
      } catch (error) {
        console.error('同步过程出错:', error);
        reject(error);
      }
    });
  },
  
  // 清理过期数据
  cleanupExpiredData: function() {
    let localMeasurements = storage.get(LOCAL_MEASUREMENTS_KEY) || [];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredMeasurements = localMeasurements.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= thirtyDaysAgo;
    });
    
    if (filteredMeasurements.length < localMeasurements.length) {
      storage.set(LOCAL_MEASUREMENTS_KEY, filteredMeasurements);
      console.log(`清理了 ${localMeasurements.length - filteredMeasurements.length} 条过期数据`);
    }
  },
  
  // 保存测量数据
  // 在 saveMeasurement 函数中，添加更多日志输出
  saveMeasurement: function(page, weight) {
    try {
      const measureData = {
        weight: parseFloat(weight),
        measuredAt: new Date().toISOString(),
      };
      
      console.log('开始保存测量数据:', measureData);
      
      const localId = 'local_' + Date.now();
      
      let measurements = storage.get(LOCAL_MEASUREMENTS_KEY) || [];
      measurements.unshift({
        ...measureData,
        _id: localId,
        synced: false
      });
      storage.set(LOCAL_MEASUREMENTS_KEY, measurements);
      
      console.log('本地数据保存成功，等待同步:', measurements);
      
      page.setData({
        isMeasuring: false,
        isReportReady: true,
        buttonText: '查看检测报告',
        hintText: '测量完成',
        measurementId: localId,
        isHintMeasuring: false,
        connectError: false,
        status: 'ready'
      });
      
      wx.vibrateShort({ type: 'medium' });
      
      this.syncToServer(page, weight, localId);
      
    } catch (err) {
      console.error('本地保存失败:', err);
      page.setData({
        isMeasuring: false,
        buttonText: '重新测量',
        hintText: '保存失败，请重试',
        connectError: true,
        isHintMeasuring: false,
        status: ''
      });
      
      wx.showToast({
        title: '数据保存失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 同步到服务器
  syncToServer: function(page, weight, localId) {
    let isSimulator = false;
    try {
      const systemInfo = wx.getAppBaseInfo();
      isSimulator = systemInfo.platform === 'devtools';
    } catch (e) {
      try {
        const systemInfo = {
          ...wx.getDeviceInfo(),
          ...wx.getWindowInfo(),
          ...wx.getAppBaseInfo()
        };
        isSimulator = systemInfo.platform === 'devtools';
      } catch (err) {}
    }
    
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType !== 'none') {
          console.log('网络可用，开始同步数据到云端');
          
          if (isSimulator) {
            console.log('模拟器环境，模拟同步成功');
            return;
          }
          
          // 修改这里，使用云函数调用
          wx.cloud.callFunction({
            name: 'user',
            data: {
              type: 'addMeasurement',
              data: {
                weight: parseFloat(weight),
                bodyFat: 20.1,  // 模拟数据
                muscle: 54.2,   // 模拟数据
                water: 65.0,    // 模拟数据
                bone: 3.1,      // 模拟数据
                bmi: 22.5       // 模拟数据
              }
            }
          }).then(result => {
            console.log('同步成功，服务器返回:', result);
            if (result && result.result && result.result._id) {
              page.setData({ measurementId: result.result._id });
              
              let updatedMeasurements = storage.get(LOCAL_MEASUREMENTS_KEY) || [];
              updatedMeasurements = updatedMeasurements.map(item => {
                if (item._id === localId) {
                  return { ...item, _id: result.result._id, synced: true };
                }
                return item;
              });
              storage.set(LOCAL_MEASUREMENTS_KEY, updatedMeasurements);
            }
          }).catch(err => {
            console.error('同步失败，详细错误:', err);
          });
        }
      }
    });
  },
  
  // 模拟设备连接
  simulateDeviceConnection: function(page) {
    // 模拟连接过程
    page.setData({
      hintText: '正在连接设备...'
    });
    
    // 模拟连接延迟
    setTimeout(() => {
      // 模拟连接成功率 90%
      const isConnected = Math.random() > 0.1;
      
      if (isConnected) {
        // 连接成功
        page.setData({
          hintText: '请站稳，开始测量',
          isHintMeasuring: true
        });
        
        // 震动反馈
        wx.vibrateShort({
          type: 'medium',
          success: () => console.log('震动成功'),
          fail: (err) => console.error('震动失败', err)
        });
        
        // 开始模拟测量过程
        page.animateWeight();
      } else {
        // 连接失败
        page.setData({
          isMeasuring: false,
          buttonText: '重新连接',
          hintText: '连接失败，请重试',
          connectError: true,
          status: ''
        });
      }
    }, 1500); // 模拟连接时间
  },
  
  // 体重动画效果
  animateWeight: function(page) {
    let count = 0;
    let targetWeight = 65.8;
    let currentWeight = 0;
    let duration = 3000;
    let interval = 16;
    let steps = duration / interval;
    
    if(page.weightTimer) {
      clearInterval(page.weightTimer);
    }
    
    page.weightTimer = setInterval(() => {
      count++;
      
      if (count <= steps) {
        let progress = count / steps;
        let easedProgress = 1 - Math.pow(1 - progress, 3);
        currentWeight = (targetWeight * easedProgress).toFixed(2);
      } else {
        currentWeight = targetWeight.toFixed(2);
        clearInterval(page.weightTimer);
        page.weightTimer = null;
        
        page.saveMeasurement(currentWeight);
      }
      
      page.setData({
        weight: currentWeight
      });
    }, interval);
  }
};

module.exports = measureService;