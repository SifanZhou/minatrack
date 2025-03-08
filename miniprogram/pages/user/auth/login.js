// 引入API服务
const api = require('../../../services/api');
const errorHandler = require('../../../services/error');

Page({
  data: {
    isLoading: false,
    inviteCode: '' // 添加邀请码字段
  },

  onLoad: function(options) {
    console.log('登录页面加载');
    
    // 保存邀请码参数
    if (options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode });
      // 保存到本地存储，以防页面重载丢失
      wx.setStorageSync('pendingInviteCode', options.inviteCode);
    }
    
    // 获取系统信息
    try {
      const systemInfo = {
        ...wx.getDeviceInfo(),
        ...wx.getWindowInfo(),
        ...wx.getAppBaseInfo()
      };
      this.setData({ systemInfo });
    } catch (err) {
      console.error('获取系统信息失败:', err);
    }
  
    // 检查是否已登录并完善信息
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    const userData = wx.getStorageSync('userData');
    const hasCompletedRegistration = wx.getStorageSync('hasCompletedRegistration');
    
    // 只有当用户信息完整且已完成注册流程时才直接跳转到测量页面
    if (userInfo && userProfile && userProfile.height && userData && hasCompletedRegistration) {
      wx.reLaunch({
        url: '/pages/user/index/measure'
      });
    }
  },

  getUserProfile: function() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        if (!res || !res.userInfo) {
          errorHandler.showError('获取用户信息失败');
          this.setData({ isLoading: false });
          return;
        }
    
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        
        wx.showLoading({ title: '登录中' });
        
        // 调用云函数进行登录
        wx.cloud.callFunction({
          name: 'user',
          data: {
            action: 'login',
            type: 'user',
            userInfo: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              gender: userInfo.gender,
              country: userInfo.country,
              province: userInfo.province,
              city: userInfo.city,
              language: userInfo.language
            },
            inviteCode: this.data.inviteCode || wx.getStorageSync('pendingInviteCode') // 添加邀请码
          },
          success: (result) => {
            try {
              console.log('云函数返回结果:', result);  // 添加调试日志
              
              if (!result || !result.result) {
                throw new Error('返回数据格式错误');
              }
    
              if (result.result.success) {
                const userData = result.result.data;
                wx.setStorageSync('userData', userData);
                wx.hideLoading();
                
                // 清除临时存储的邀请码
                wx.removeStorageSync('pendingInviteCode');
                
                // 检查用户是否已完善资料并且已经完成注册流程
                const hasCompletedRegistration = wx.getStorageSync('hasCompletedRegistration');
                if (userData.profile && userData.profile.height && hasCompletedRegistration) {
                  // 已完善资料且完成注册，保存用户资料并跳转到测量页面
                  wx.setStorageSync('userProfile', userData.profile);
                  wx.reLaunch({
                    url: '/pages/user/index/measure'
                  });
                } else {
                  // 未完善资料或未完成注册流程，跳转到注册页面
                  wx.navigateTo({
                    url: `/pages/user/auth/register?inviteCode=${this.data.inviteCode || ''}`
                  });
                }
              } else {
                throw new Error(result.result.message || '登录失败');
              }
            } catch (e) {
              console.error('处理登录结果出错:', e);
              wx.hideLoading();
              errorHandler.showError(e.message || '登录处理出错');
            }
          },
          fail: (err) => {
            console.error('云函数调用失败:', err);
            wx.hideLoading();
            errorHandler.showError('网络错误，请重试');
          },
          complete: () => {
            this.setData({ isLoading: false });
          }
        });
      },
      fail: (err) => {
        console.log('获取用户信息失败:', err);
        errorHandler.showError('获取用户信息失败');
        this.setData({ isLoading: false });
      }
    });
  }
});