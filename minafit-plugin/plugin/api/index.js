/**
 * VTBLE Scale SDK 小程序原生插件API
 * 封装与蓝牙体脂秤交互的核心功能
 */

const reportModule = require('./report');

module.exports = {
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
  
  // 生成体脂检测报告
  generateReport(weightData, bodyData, hrData, userInfo) {
    return reportModule.generateReport(weightData, bodyData, hrData, userInfo);
  },
  
  // 评估体脂率
  evaluateBodyFat(bodyFat, gender, age) {
    return reportModule.evaluateBodyFat(bodyFat, gender, age);
  },
  
  // 评估肌肉率
  evaluateMuscleMass(muscleMass, gender, age) {
    return reportModule.evaluateMuscleMass(muscleMass, gender, age);
  },
  
  // 评估内脏脂肪
  evaluateVisceralFat(visceralFat) {
    return reportModule.evaluateVisceralFat(visceralFat);
  },
  
  // 评估基础代谢率
  evaluateBMR(bmr, gender, age) {
    return reportModule.evaluateBMR(bmr, gender, age);
  },
  
  // 评估体重
  evaluateWeight(weight, height) {
    return reportModule.evaluateWeight(weight, height);
  }
};