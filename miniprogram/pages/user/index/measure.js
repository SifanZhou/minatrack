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

  onLoad: function() {
    // 检查用户是否已完成注册
    const userService = require('../../../services/user');
    userService.checkUserRegistration().then(registered => {
      if (!registered) {
        wx.showModal({
          title: '完善资料',
          content: '请先完善您的个人资料，以便获得更准确的测量结果',
          showCancel: false,
          success: () => {
            userService.redirectToRegister();
          }
        });
      } else {
        // 用户已注册，继续加载页面
        // 修改这里，直接调用相关函数而不是不存在的loadPageData
        console.log('页面加载');
        this.loadUserInfo();
        
        // 添加同步重试机制
        setTimeout(() => {
          this.syncLocalData();
        }, 1000);
      }
    });
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
        });
      } else {
        console.log('同步完成（非Promise返回）');
      }
    } catch (err) {
      console.error('同步过程出错:', err);
    }
  },
  
  // 初始化页面数据
  initPageData: function() {
    if(!this.data.isMeasuring) {
      this.setData({
        weight: '0.00',
        buttonText: '连接体脂秤',
        hintText: '请光脚上秤',
        isReportReady: false,
        connectError: false,
        status: ''
      });
    }
  },

  // 加载用户信息
  loadUserInfo: function() {
    userService.loadUserInfo(this);
  },
  
  // 保存测量数据
  saveMeasurement: function(weight) {
    measureService.saveMeasurement(this, weight);
  },
  
  // 头像点击处理
  handleAvatarTap: function() {
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

  // 连接设备处理
  handleConnect: function() {
    console.log('按钮被点击');
    
    if (this.data.isReportReady && this.data.measurementId) {
      wx.navigateTo({
        url: `/pages/user/index/report?id=${this.data.measurementId}&fromMeasure=true`
      });
      return;
    }

    if (this.data.isMeasuring) return;

    this.setData({
      isMeasuring: true,
      buttonText: '测量中',
      hintText: '正在连接',
      connectError: false,
      isHintMeasuring: false,
      status: 'measuring'
    });

    measureService.simulateDeviceConnection(this);
  },
  
  // 体重动画效果
  animateWeight: function() {
    measureService.animateWeight(this);
  }
});