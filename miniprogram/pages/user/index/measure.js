// 引入API服务
const api = require('../../../services/api');
const storage = require('../../../services/storage');
const errorHandler = require('../../../services/error');
const LOCAL_MEASUREMENTS_KEY = 'local_measurements';

// 引入拆分出的功能模块
const userService = require('../../../services/user');
const measureService = require('../../../services/measure');

// 确保模块正确加载
console.log('模块加载状态:', {
  api: !!api,
  storage: !!storage,
  userService: !!userService,
  measureService: !!measureService
});

Page({
  data: {
    userInfo: null,
    weight: '0.00',
    buttonText: '连接体脂秤',
    hintText: '请光脚上秤',
    isMeasuring: false,
    isReportReady: false,
    connectError: false,
    measurementId: null,
    status: '',
    isHintMeasuring: false,
    // 新增设备搜索相关数据
    showDeviceList: false,
    devices: [],
    searching: false,
    selectedDevice: null
  },

  onLoad: function(options) {
    console.log('页面加载');
    
    // 检查用户是否已完成注册
    const hasCompletedRegistration = wx.getStorageSync('hasCompletedRegistration');
    const userProfile = wx.getStorageSync('userProfile');
    
    if (!hasCompletedRegistration || !userProfile) {
      // 如果用户未完成注册，重定向到登录页面
      wx.reLaunch({
        url: '/pages/user/auth/login'
      });
      return;
    }
    
    // 加载本地用户信息，不依赖网络请求
    this.loadLocalUserInfo();
    
    // 确保用户已登录，但不阻塞页面加载
    userService.ensureLogin()
      .then(() => {
        console.log('用户已登录，开始同步数据');
        // 尝试从服务器获取最新用户信息，但失败时不影响主流程
        this.loadUserInfo();
        
        // 添加同步重试机制
        setTimeout(() => {
          this.syncLocalData();
        }, 1000);
      })
      .catch(err => {
        console.error('登录检查失败，使用本地数据:', err);
        // 即使登录检查失败，也尝试同步本地数据
        setTimeout(() => {
          this.syncLocalData();
        }, 1000);
      });
  },

  // 加载本地用户信息，不依赖网络
  loadLocalUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 设置默认用户信息
      this.setData({
        userInfo: {
          nickName: '未登录用户',
          avatarUrl: '',
          gender: 0
        }
      });
    }
  },

  // 同步本地数据
  syncLocalData: function() {
    console.log('开始同步本地数据');
    try {
      const result = measureService.syncLocalMeasurements(this);
      if (result && typeof result.then === 'function') {
        result.then(() => {
          console.log('数据同步完成');
        }).catch(err => {
          console.error('数据同步失败:', err);
          // 添加重试机制
          setTimeout(() => {
            console.log('尝试重新同步数据');
            this.syncLocalData();
          }, 5000); // 5秒后重试
        });
      } else {
        console.log('同步完成（非Promise返回）');
      }
    } catch (err) {
      console.error('同步过程出错:', err);
    }
  },
  
  // 初始化页面数据 - 使用服务模块
  initPageData: function() {
    measureService.initMeasurePage(this);
  },

  // 加载用户信息
  loadUserInfo: function() {
    userService.loadUserInfo(this);
  },
  
  // 头像点击处理
  handleAvatarTap: function() {
    // 如果正在测量中，不响应点击事件
    if (this.data.isMeasuring) {
      return;
    }
    
    console.log('头像被点击');
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    });
  },
  
  // 添加历史记录按钮点击处理
  handleHistoryTap: function() {
    console.log('历史记录按钮被点击');
    wx.navigateTo({
      url: '/pages/user/index/history'
    });
  },

  // 底部按钮点击处理
  handleBtnTap: function(e) {
    const status = e.currentTarget.dataset.status;
    if (status === 'measuring') return;
    this.handleConnect();
  },

  // 连接设备处理 - 使用服务模块
  handleConnect: function() {
    console.log('按钮被点击');
    measureService.handleConnect(this);
  },
  
  // 选择设备处理
  selectDevice: function(e) {
    const deviceId = e.currentTarget.dataset.id;
    console.log('选择设备:', deviceId);
    
    this.setData({
      selectedDevice: deviceId
    });
    
    // 连接选中的设备
    measureService.connectSelectedDevice(this, deviceId);
    
    // 设置数据更新监听
    measureService.handleDataUpdate(this);
  },
  
  // 取消设备选择
  cancelDeviceSelection: function() {
    console.log('取消设备选择');
    
    // 停止扫描
    measureService.stopScan();
    
    this.setData({
      showDeviceList: false,
      isMeasuring: false,
      buttonText: '连接体脂秤',
      hintText: '请光脚上秤',
      status: ''
    });
  }
  
  // 移除了重复的 animateWeight 和 saveMeasurement 方法，这些已经在 measureService 中实现
});