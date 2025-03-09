# VTBLE Scale SDK 小程序原生插件封装指南

## 项目概述

本项目旨在将VTBLE Scale SDK封装为微信小程序可用的原生插件，实现小程序与蓝牙体脂秤的连接、数据获取等功能。

## 实现步骤

### 1. 创建小程序原生插件项目结构

```
project/
  ├── miniprogram/           # 小程序示例代码
  │   ├── app.js
  │   ├── app.json
  │   ├── app.wxss
  │   └── pages/             # 页面文件
  │       └── index/         # 首页
  │           ├── index.js
  │           ├── index.json
  │           ├── index.wxml
  │           └── index.wxss
  ├── plugin/                # 插件代码
  │   ├── api/               # API接口定义
  │   │   └── index.js       # 接口导出
  │   ├── components/        # 自定义组件
  │   ├── plugin.json        # 插件配置
  │   └── index.js           # 插件入口
  ├── src/                   # 原生代码
  │   ├── android/           # Android原生代码
  │   │   ├── vtble-wrapper/ # SDK封装代码
  │   │   └── libs/          # SDK依赖库
  │   └── ios/               # iOS原生代码(如有)
  └── project.config.json    # 项目配置
```

### 2. 封装SDK核心功能

#### Android端封装

1. **创建原生插件模块**：
   - 创建一个Android库模块，引入VTBLE Scale SDK
   - 实现JSBridge接口，用于与小程序通信

2. **封装核心功能**：
   - 初始化SDK：`initSDK(key)`
   - 扫描设备：`startScan(timeout, deviceList)`
   - 连接设备：`connectDevice(deviceId)`
   - 断开连接：`disconnect()`
   - 获取数据：`setUserInfo(userInfo)` 和数据回调

3. **权限处理**：
   - 处理蓝牙相关权限申请
   - 适配不同Android版本的权限差异

4. **生命周期管理**：
   - 在适当的生命周期释放资源
   - 处理应用前后台切换

### 3. 实现JSBridge接口

在Android端实现以下接口：

```java
public class VTBLEBridge {
    // 初始化SDK
    public void initSDK(String key, JSCallback callback);
    
    // 开始扫描设备
    public void startScan(int timeout, JSCallback callback);
    
    // 停止扫描
    public void stopScan(JSCallback callback);
    
    // 连接设备
    public void connectDevice(String deviceId, JSCallback callback);
    
    // 断开连接
    public void disconnect(JSCallback callback);
    
    // 设置用户信息
    public void setUserInfo(JSONObject userInfo, JSCallback callback);
    
    // 检查设备是否支持心率
    public void isSupportHR(JSCallback callback);
    
    // 启用心率数据
    public void enableHRData(int seconds, JSCallback callback);
}
```

### 4. 小程序端接口封装

在小程序插件中封装以下接口：

```javascript
// plugin/api/index.js
export default {
  // 初始化SDK
  initSDK(key) {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'initSDK',
        args: { key },
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 开始扫描设备
  startScan(timeout = 30) {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'startScan',
        args: { timeout },
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 停止扫描
  stopScan() {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'stopScan',
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 连接设备
  connectDevice(deviceId) {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'connectDevice',
        args: { deviceId },
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 断开连接
  disconnect() {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'disconnect',
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 设置用户信息
  setUserInfo(userInfo) {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'setUserInfo',
        args: { userInfo },
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 检查设备是否支持心率
  isSupportHR() {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'isSupportHR',
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 启用心率数据
  enableHRData(seconds = 30) {
    return new Promise((resolve, reject) => {
      wx.invokePluginApi({
        api: 'enableHRData',
        args: { seconds },
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 监听体重数据
  onWeightData(callback) {
    wx.onPluginEvent({
      eventName: 'onWeightData',
      callback
    });
  },
  
  // 监听体脂数据
  onBodyData(callback) {
    wx.onPluginEvent({
      eventName: 'onBodyData',
      callback
    });
  },
  
  // 监听心率数据
  onHRData(callback) {
    wx.onPluginEvent({
      eventName: 'onHRData',
      callback
    });
  },
  
  // 生成测量报告
  generateReport(weightData, bodyData, hrData, userInfo) {
    // 根据测量数据和用户信息生成结构化的体脂报告
    // weightData: 体重数据对象 {weight, timestamp}
    // bodyData: 体脂数据对象 {bodyFat, muscleMass, visceralFat, bmr, bodyWater, boneMass, timestamp}
    // hrData: 心率数据对象 {hr, timestamp}，可选
    // userInfo: 用户信息对象 {age, height, gender}
    
    // 返回结构化的报告数据，包含以下内容：
    return {
      reportId: 'report_' + Date.now(),
      reportTime: new Date().toISOString(),
      userInfo: userInfo,
      weightAssessment: {
        weight: weightData.weight,
        bmi: calculateBMI(weightData.weight, userInfo.height),
        level: assessWeightLevel(weightData.weight, userInfo),
        suggestion: generateWeightSuggestion(weightData.weight, userInfo),
        standardRange: calculateStandardWeightRange(userInfo)
      },
      bodyComposition: {
        bodyFat: {
          value: bodyData.bodyFat,
          level: assessBodyFatLevel(bodyData.bodyFat, userInfo),
          suggestion: generateBodyFatSuggestion(bodyData.bodyFat, userInfo),
          standardRange: calculateStandardBodyFatRange(userInfo)
        },
        muscleMass: {
          value: bodyData.muscleMass,
          level: assessMuscleMassLevel(bodyData.muscleMass, userInfo),
          suggestion: generateMuscleMassSuggestion(bodyData.muscleMass, userInfo),
          standardRange: calculateStandardMuscleMassRange(userInfo)
        },
        visceralFat: {
          value: bodyData.visceralFat,
          level: assessVisceralFatLevel(bodyData.visceralFat),
          suggestion: generateVisceralFatSuggestion(bodyData.visceralFat),
          standardRange: [1, 9]
        },
        bmr: {
          value: bodyData.bmr,
          level: 'normal',
          suggestion: generateBMRSuggestion(bodyData.bmr, userInfo),
          standardValue: calculateStandardBMR(userInfo)
        },
        bodyWater: {
          value: bodyData.bodyWater,
          standardRange: calculateStandardBodyWaterRange(userInfo)
        },
        boneMass: {
          value: bodyData.boneMass
        }
      },
      heartRate: hrData ? {
        value: hrData.hr,
        standardRange: [60, 100]
      } : null,
      overallAssessment: {
        level: generateOverallLevel(weightData, bodyData, userInfo),
        suggestion: generateOverallSuggestion(weightData, bodyData, userInfo)
      }
    };
  }
};
```

### 5. 示例小程序实现

创建一个简单的示例小程序，展示如何使用插件：

```javascript
// miniprogram/pages/index/index.js
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
  },
  
  // 生成报告
  generateReport() {
    if (!this.data.weightData || !this.data.bodyData) {
      console.error('缺少必要的测量数据');
      return;
    }
    
    const report = plugin.generateReport(
      this.data.weightData,
      this.data.bodyData,
      this.data.hrData,
      {
        age: 27,
        height: 185,
        gender: 0
      }
    );
    
    console.log('生成的报告:', report);
    // 可以将报告保存到云数据库或本地存储
  }
});
```

## 注意事项

1. **权限处理**：
   - 小程序需要在app.json中声明蓝牙相关权限
   - Android端需要处理动态权限申请

2. **生命周期管理**：
   - 在小程序onHide时考虑是否需要断开连接
   - 在小程序onShow时考虑是否需要重新连接

3. **错误处理**：
   - 实现完善的错误处理机制
   - 向小程序端提供清晰的错误信息

4. **兼容性**：
   - 考虑不同Android版本的兼容性
   - 考虑不同微信版本的兼容性

5. **报告生成**：
   - generateReport方法根据测量数据和用户信息生成结构化的体脂报告