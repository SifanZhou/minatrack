Page({
  data: {
    userInfo: null,
    userProfile: null,
    loading: true,
    hasTrainer: false,
    trainerInfo: null,
    statusBarHeight: 0  // 添加状态栏高度数据
  },

  onLoad: function() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    
    this.setData({
      userInfo,
      userProfile,
      loading: false
    });
  },
  
  editProfile: function() {
    wx.navigateTo({
      url: '/pages/user/auth/register'
    });
  },

  bindTrainer: function() {
    wx.showActionSheet({
      itemList: ['扫描二维码', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.scanCode({
            success: (scanRes) => {
              this.handleScanResult(scanRes.result);
            }
          });
        } else {
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: (imageRes) => {
              wx.scanCode({
                scanType: ['qrCode'],
                image: imageRes.tempFilePaths[0],
                success: (scanRes) => {
                  this.handleScanResult(scanRes.result);
                }
              });
            }
          });
        }
      }
    });
  },

  handleScanResult: function(result) {
    wx.showLoading({ title: '正在绑定...' });
    
    wx.cloud.callFunction({
      name: 'bindTrainer',
      data: { trainerCode: result },
      success: (res) => {
        if (res.result && res.result.success) {
          this.setData({
            hasTrainer: true,
            trainerInfo: res.result.trainerInfo
          });
          wx.showToast({ title: '绑定成功' });
        } else {
          wx.showToast({ 
            title: '绑定失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('绑定失败:', err);
        wx.showToast({ 
          title: '绑定失败',
          icon: 'error'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/user/auth/login'
          });
        }
      }
    });
  },  // 这里添加了逗号
  
  // 添加导航到历史记录页面的方法
  navigateToHistory: function() {  // 修改为标准函数声明格式
    wx.navigateTo({
      url: '/pages/user/index/history'  // 修改为正确的历史记录页面路径
    });
  },  // 这里添加了逗号
  
  handleClose: function() {
    wx.navigateBack();
  }

});