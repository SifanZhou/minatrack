Page({
  data: {},

  onLoad: function() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    
    if (userInfo && userProfile && userProfile.height) {
      // 已登录且完善信息，直接进入测量页面
      wx.reLaunch({
        url: '/pages/user/index/measure'
      });
    }
  },

  navigateToUserLogin: function() {
    wx.reLaunch({
      url: '/pages/user/auth/login'
    });
  },

  navigateToAdminLogin: function() {
    // 修改为跳转到管理师登录页面
    wx.navigateTo({
      url: '/pages/specialist/auth/login'
    });
  }
});