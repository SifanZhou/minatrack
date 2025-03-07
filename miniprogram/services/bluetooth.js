/**
 * 蓝牙设备服务 - 处理蓝牙设备连接和数据交互
 */
const bluetooth = {
  // 设备连接状态
  isConnecting: false,
  isConnected: false,
  deviceId: null,
  serviceId: null,
  characteristicId: null,
  
  // 监听回调
  listeners: {
    onWeightChange: null,
    onConnected: null,
    onDisconnected: null,
    onError: null
  },
  
  /**
   * 初始化蓝牙模块
   * @returns {Promise}
   */
  init: function() {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: (res) => {
          console.log('蓝牙初始化成功', res);
          this.startBluetoothDevicesDiscovery();
          resolve(res);
        },
        fail: (err) => {
          console.error('蓝牙初始化失败', err);
          // 提示用户打开蓝牙
          wx.showModal({
            title: '提示',
            content: '请打开手机蓝牙后重试',
            showCancel: false
          });
          reject(err);
        }
      });
    });
  },
  
  /**
   * 开始搜索蓝牙设备
   */
  startBluetoothDevicesDiscovery: function() {
    wx.startBluetoothDevicesDiscovery({
      services: [], // 根据实际设备填写服务UUID
      allowDuplicatesKey: false,
      success: (res) => {
        console.log('开始搜索蓝牙设备', res);
        this.onBluetoothDeviceFound();
      },
      fail: (err) => {
        console.error('搜索蓝牙设备失败', err);
        if (this.listeners.onError) {
          this.listeners.onError('搜索设备失败');
        }
      }
    });
  },
  
  /**
   * 监听发现新设备事件
   */
  onBluetoothDeviceFound: function() {
    wx.onBluetoothDeviceFound((res) => {
      const devices = res.devices;
      console.log('发现新设备', devices);
      
      // 这里根据设备名称或ID筛选目标设备
      // 实际开发中需要根据具体设备特征进行筛选
      const targetDevice = devices.find(device => {
        // 示例：筛选名称包含"体脂秤"的设备
        return device.name && device.name.includes('体脂秤');
      });
      
      if (targetDevice) {
        console.log('找到目标设备', targetDevice);
        this.connectDevice(targetDevice.deviceId);
      }
    });
  },
  
  /**
   * 连接设备
   * @param {String} deviceId - 设备ID
   */
  connectDevice: function(deviceId) {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    this.deviceId = deviceId;
    
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        console.log('连接设备成功', res);
        this.isConnected = true;
        this.isConnecting = false;
        
        // 获取设备服务
        this.getBLEDeviceServices(deviceId);
        
        if (this.listeners.onConnected) {
          this.listeners.onConnected();
        }
      },
      fail: (err) => {
        console.error('连接设备失败', err);
        this.isConnecting = false;
        
        if (this.listeners.onError) {
          this.listeners.onError('连接设备失败');
        }
      }
    });
  },
  
  /**
   * 获取设备服务
   * @param {String} deviceId - 设备ID
   */
  getBLEDeviceServices: function(deviceId) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        console.log('获取设备服务成功', res);
        
        // 这里需要根据实际设备选择正确的服务
        // 示例：选择第一个服务
        if (res.services && res.services.length > 0) {
          const serviceId = res.services[0].uuid;
          this.serviceId = serviceId;
          this.getBLEDeviceCharacteristics(deviceId, serviceId);
        }
      },
      fail: (err) => {
        console.error('获取设备服务失败', err);
      }
    });
  },
  
  /**
   * 获取特征值
   * @param {String} deviceId - 设备ID
   * @param {String} serviceId - 服务ID
   */
  getBLEDeviceCharacteristics: function(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('获取特征值成功', res);
        
        // 查找可通知的特征值
        const characteristic = res.characteristics.find(item => {
          return (item.properties.notify || item.properties.indicate);
        });
        
        if (characteristic) {
          this.characteristicId = characteristic.uuid;
          this.notifyBLECharacteristicValueChange(deviceId, serviceId, characteristic.uuid);
        }
      },
      fail: (err) => {
        console.error('获取特征值失败', err);
      }
    });
  },
  
  /**
   * 启用特征值变化通知
   */
  notifyBLECharacteristicValueChange: function(deviceId, serviceId, characteristicId) {
    wx.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId,
      characteristicId,
      state: true,
      success: (res) => {
        console.log('启用通知成功', res);
        this.onBLECharacteristicValueChange();
      },
      fail: (err) => {
        console.error('启用通知失败', err);
      }
    });
  },
  
  /**
   * 监听特征值变化
   */
  onBLECharacteristicValueChange: function() {
    wx.onBLECharacteristicValueChange((res) => {
      console.log('收到设备数据', res);
      
      // 解析设备数据，这里需要根据实际设备协议进行解析
      const buffer = res.value;
      const dataView = new DataView(buffer);
      
      // 示例：假设前两个字节表示体重，单位为kg，精度为0.01kg
      const weightValue = dataView.getUint16(0, true) / 100;
      console.log('解析到体重数据:', weightValue);
      
      if (this.listeners.onWeightChange) {
        this.listeners.onWeightChange(weightValue);
      }
    });
  },
  
  /**
   * 断开设备连接
   */
  disconnect: function() {
    if (!this.deviceId) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      wx.closeBLEConnection({
        deviceId: this.deviceId,
        success: (res) => {
          console.log('断开设备连接成功', res);
          this.isConnected = false;
          this.deviceId = null;
          
          if (this.listeners.onDisconnected) {
            this.listeners.onDisconnected();
          }
          
          resolve(res);
        },
        fail: (err) => {
          console.error('断开设备连接失败', err);
          reject(err);
        }
      });
    });
  },
  
  /**
   * 注册监听器
   * @param {Object} listeners - 监听器对象
   */
  registerListeners: function(listeners) {
    this.listeners = { ...this.listeners, ...listeners };
  },
  
  /**
   * 清理资源
   */
  destroy: function() {
    this.disconnect().then(() => {
      wx.stopBluetoothDevicesDiscovery();
      wx.closeBluetoothAdapter();
    });
    
    this.listeners = {
      onWeightChange: null,
      onConnected: null,
      onDisconnected: null,
      onError: null
    };
  }
};

module.exports = bluetooth;    