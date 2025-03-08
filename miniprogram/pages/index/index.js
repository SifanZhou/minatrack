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

  onShow: function() {
    // 检查是否需要跳转到个人资料页
    const redirectToProfile = wx.getStorageSync('redirectToProfile');
    if (redirectToProfile) {
      // 清除标记
      wx.removeStorageSync('redirectToProfile');
      // 延迟跳转，确保当前页面已完全加载
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/profile/profile'
        });
      }, 200);
    }
    
    // 原有的onShow逻辑...
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