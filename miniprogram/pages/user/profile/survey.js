Page({
  data: {
    userInfo: null,
    userProfile: null,
    loading: true
  },

  onLoad: function() {
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
  }
});