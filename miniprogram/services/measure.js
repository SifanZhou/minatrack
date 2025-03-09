// 测量相关服务
const api = require('./api');
const storage = require('./storage');
const LOCAL_MEASUREMENTS_KEY = 'local_measurements';

// 引入体脂秤插件
const plugin = requirePlugin('vtble-plugin');

// 定义数据结构
const WeightData = {
  weight: 0,
  timestamp: 0
};

const BodyData = {
  bodyFat: 0,
  muscleMass: 0,
  visceralFat: 0,
  bmr: 0,
  bodyWater: 0,
  boneMass: 0,
  timestamp: 0
};

const HRData = {
  hr: 0,
  timestamp: 0
};

const measureService = {
  // 插件相关数据
  pluginData: {
    weightData: null,
    bodyData: null,
    hrData: null,
    initialized: false
  },
  
  // 初始化SDK
  initSDK: function() {
    if (this.pluginData.initialized) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        // 初始化SDK - 实际应用中应该使用正确的密钥
        plugin.initSDK('minatrack_sdk_key')
          .then(() => {
            console.log('体脂秤SDK初始化成功');
            this.setupListeners();
            this.pluginData.initialized = true;
            resolve();
          })
          .catch(error => {
            console.error('体脂秤SDK初始化失败', error);
            reject(error);
          });
      } catch (error) {
        console.error('SDK初始化过程出错', error);
        reject(error);
      }
    });
  },
  
  // 设置数据监听
  setupListeners: function() {
    // 监听体重数据
    plugin.onWeightData(data => {
      this.pluginData.weightData = data;
      console.log('接收到体重数据', data);
    });
    
    // 监听体脂数据
    plugin.onBodyData(data => {
      this.pluginData.bodyData = data;
      console.log('接收到体脂数据', data);
    });
    
    // 监听心率数据
    plugin.onHRData(data => {
      this.pluginData.hrData = data;
      console.log('接收到心率数据', data);
    });
  },
  
  // 开始扫描设备
  startScan: function(timeout = 30) {
    return plugin.startScan(timeout);
  },
  
  // 停止扫描
  stopScan: function() {
    return plugin.stopScan();
  },
  
  // 连接设备
  connectDevice: function(deviceId, userInfo) {
    return new Promise((resolve, reject) => {
      plugin.connectDevice(deviceId)
        .then(() => {
          // 设置用户信息
          return plugin.setUserInfo({
            age: userInfo.age || 25,
            height: userInfo.height || 170,
            gender: userInfo.gender || 0 // 默认男性
          });
        })
        .then(() => {
          console.log('设备连接成功');
          resolve();
        })
        .catch(error => {
          console.error('设备连接失败', error);
          reject(error);
        });
    });
  },
  
  // 断开连接
  disconnect: function() {
    return plugin.disconnect();
  },
  
  // 检查设备是否支持心率
  isSupportHR: function() {
    return plugin.isSupportHR();
  },
  
  // 启用心率数据
  enableHRData: function(seconds = 30) {
    return plugin.enableHRData(seconds);
  },
  
  // 生成测量报告
  generateReport: function(userInfo) {
    if (!this.pluginData.weightData || !this.pluginData.bodyData) {
      console.error('缺少必要的测量数据，无法生成报告');
      return null;
    }
    
    try {
      const report = plugin.generateReport(
        this.pluginData.weightData,
        this.pluginData.bodyData,
        this.pluginData.hrData,
        {
          age: userInfo.age || 25,
          height: userInfo.height || 170,
          gender: userInfo.gender || 0
        }
      );
      
      return report;
    } catch (error) {
      console.error('生成报告失败', error);
      return null;
    }
  },
  
  // 重置测量数据
  resetData: function() {
    this.pluginData.weightData = null;
    this.pluginData.bodyData = null;
    this.pluginData.hrData = null;
  },
  
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
  
  // 初始化测量页面数据
  initMeasurePage: function(page) {
    if(!page.data.isMeasuring) {
      page.setData({
        weight: '0.00',
        buttonText: '连接体脂秤',
        hintText: '请光脚上秤',
        isReportReady: false,
        connectError: false,
        status: ''
      });
    }
  },
  
  // 处理连接请求
  handleConnect: function(page) {
    console.log('处理连接请求');
    
    if (page.data.isReportReady && page.data.measurementId) {
      wx.navigateTo({
        url: `/pages/user/index/report?id=${page.data.measurementId}&fromMeasure=true`
      });
      return;
    }

    if (page.data.isMeasuring) return;

    // 初始化SDK
    this.initSDK().then(() => {
      // 设置页面状态为搜索设备
      page.setData({
        isMeasuring: true,
        buttonText: '搜索设备中',
        hintText: '正在搜索附近的体脂秤...',
        connectError: false,
        isHintMeasuring: false,
        status: 'searching',
        showDeviceList: true,
        devices: [],
        searching: true
      });
      
      // 开始扫描设备
      return this.startScan();
    }).then(devices => {
      console.log('发现设备:', devices);
      
      // 更新设备列表
      page.setData({
        devices: devices,
        searching: false,
        buttonText: '请选择设备',
        hintText: devices.length > 0 ? '请选择一个设备连接' : '未找到设备，请重试'
      });
      
      // 如果没有找到设备
      if (devices.length === 0) {
        setTimeout(() => {
          page.setData({
            isMeasuring: false,
            buttonText: '重新连接',
            hintText: '未找到设备，请重试',
            connectError: true,
            status: ''
          });
        }, 2000);
      }
    }).catch(error => {
      console.error('设备搜索失败:', error);
      page.setData({
        isMeasuring: false,
        buttonText: '重新连接',
        hintText: '连接失败，请重试',
        connectError: true,
        status: '',
        searching: false,
        showDeviceList: false
      });
    });
  },
  
  // 连接选中的设备
  connectSelectedDevice: function(page, deviceId) {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      age: 25,
      height: 170,
      gender: 0
    };
    
    page.setData({
      buttonText: '连接中',
      hintText: '正在连接设备...',
      showDeviceList: false
    });
    
    this.connectDevice(deviceId, userInfo)
      .then(() => {
        // 连接成功
        page.setData({
          hintText: '请站稳，开始测量',
          isHintMeasuring: true
        });
        
        // 震动反馈
        wx.vibrateShort({
          type: 'medium'
        });
        
        // 检查是否支持心率
        return this.isSupportHR();
      })
      .then(supportHR => {
        if (supportHR) {
          return this.enableHRData();
        }
      })
      .catch(error => {
        console.error('设备连接失败:', error);
        page.setData({
          isMeasuring: false,
          buttonText: '重新连接',
          hintText: '连接失败，请重试',
          connectError: true,
          status: ''
        });
      });
  },
  
  // 保存测量数据
  saveMeasurement: function(page) {
    try {
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo') || {
        age: 25,
        height: 170,
        gender: 0
      };
      
      // 生成报告
      const report = this.generateReport(userInfo);
      
      if (!report || !this.pluginData.weightData) {
        throw new Error('无法生成报告，数据不完整');
      }
      
      const weight = this.pluginData.weightData.weight;
      
      // 构建测量数据
      const measureData = {
        weight: parseFloat(weight),
        bodyFat: report.bodyComposition.bodyFat.value,
        muscle: report.bodyComposition.muscleMass.value,
        water: report.bodyComposition.bodyWater.value,
        bone: report.bodyComposition.boneMass.value,
        bmi: report.weightAssessment.bmi,
        measuredAt: new Date().toISOString(),
        reportData: report // 保存完整报告数据
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
        status: 'ready',
        weight: weight.toFixed(2)
      });
      
      wx.vibrateShort({ type: 'medium' });
      
      this.syncToServer(page, measureData, localId);
      
      // 断开设备连接
      this.disconnect().catch(err => {
        console.error('断开连接失败:', err);
      });
      
      // 重置数据
      this.resetData();
      
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
      
      // 断开设备连接
      this.disconnect().catch(err => {
        console.error('断开连接失败:', err);
      });
      
      // 重置数据
      this.resetData();
    }
  },
  
  // 同步到服务器
  syncToServer: function(page, measureData, localId) {
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
          
          // 使用云函数调用，传递完整的测量数据
          wx.cloud.callFunction({
            name: 'user',
            data: {
              type: 'addMeasurement',
              data: {
                weight: measureData.weight,
                bodyFat: measureData.bodyFat,
                muscle: measureData.muscle,
                water: measureData.water,
                bone: measureData.bone,
                bmi: measureData.bmi,
                reportData: measureData.reportData,
                measuredAt: measureData.measuredAt
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
  
  // 处理设备数据更新
  handleDataUpdate: function(page) {
    // 监听体重数据更新
    const originalOnWeightData = plugin.onWeightData;
    plugin.onWeightData = (data) => {
      // 调用原始监听器
      if (typeof originalOnWeightData === 'function') {
        originalOnWeightData(data);
      }
      
      // 更新页面显示
      if (page && data && data.weight) {
        page.setData({
          weight: data.weight.toFixed(2),
          hintText: '测量中，请保持站立'
        });
        
        // 震动反馈
        wx.vibrateShort({
          type: 'light'
        });
      }
    };
    
    // 监听体脂数据更新
    const originalOnBodyData = plugin.onBodyData;
    plugin.onBodyData = (data) => {
      // 调用原始监听器
      if (typeof originalOnBodyData === 'function') {
        originalOnBodyData(data);
      }
      
      // 当收到体脂数据时，表示测量完成，可以保存数据
      if (page && data) {
        page.setData({
          hintText: '数据分析中...'
        });
        
        // 延迟一下再保存，确保所有数据都已接收
        setTimeout(() => {
          this.saveMeasurement(page);
        }, 1000);
      }
    };
  }
};

module.exports = measureService;