const plugin = requirePlugin('vtble-plugin');

Page({
  data: {
    devices: [],
    connected: false,
    weightData: null,
    bodyData: null,
    hrData: null
  },
  
  onLoad() {
    // 初始化SDK
    plugin.initSDK('您的SDK密钥').then(() => {
      console.log('SDK初始化成功');
      
      // 监听体重数据
      plugin.onWeightData(data => {
        this.setData({ weightData: data });
      });
      
      // 监听体脂数据
      plugin.onBodyData(data => {
        this.setData({ bodyData: data });
      });
      
      // 监听心率数据
      plugin.onHRData(data => {
        this.setData({ hrData: data });
      });
    }).catch(err => {
      console.error('SDK初始化失败', err);
    });
  },
  
  // 开始扫描
  startScan() {
    plugin.startScan().then(devices => {
      this.setData({ devices });
    }).catch(err => {
      console.error('扫描失败', err);
    });
  },
  
  // 停止扫描
  stopScan() {
    plugin.stopScan();
  },
  
  // 连接设备
  connectDevice(e) {
    const deviceId = e.currentTarget.dataset.id;
    plugin.connectDevice(deviceId).then(() => {
      this.setData({ connected: true });
      
      // 设置用户信息
      plugin.setUserInfo({
        age: 27,
        height: 185,
        gender: 0 // 男:0; 女:1; 男运动员:2; 女运动员:3
      });
    }).catch(err => {
      console.error('连接失败', err);
    });
  },
  
  // 断开连接
  disconnect() {
    plugin.disconnect().then(() => {
      this.setData({ connected: false });
    }).catch(err => {
      console.error('断开连接失败', err);
    });
  }
})}