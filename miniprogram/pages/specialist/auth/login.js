// 专家登录页面
const api = require('../../../services/api');
const errorUtils = require('../../../services/utils/error');

Page({
  data: {
    isLoading: false
  },

  onLoad: function() {
    // 检查是否已登录
    const specialistData = wx.getStorageSync('specialistData');
    if (specialistData) {
      this.navigateToIndex();
    }
  },

  getSpecialistProfile: function() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    wx.getUserProfile({
      desc: '用于完善管理师资料',
      success: (res) => {
        try {
          if (!res || !res.userInfo) {
            errorUtils.showError('获取用户信息失败'); // 修改这里，使用errorUtils而不是errorHandler
            this.setData({ isLoading: false });
            return;
          }
      
          const userInfo = res.userInfo;
          wx.setStorageSync('specialistInfo', userInfo);
          
          wx.showLoading({ title: '登录中' });
          
          // 调用云函数进行登录，修改参数格式
          api.callFunction('specialist', {
            action: 'login',
            params: {  // 使用params包装参数
              userInfo: {
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                gender: userInfo.gender,
                country: userInfo.country,
                province: userInfo.province,
                city: userInfo.city,
                language: userInfo.language
              }
            }
          })
          .then(result => {
            wx.hideLoading();
            
            console.log('登录结果:', result); // 添加日志，查看完整返回结果
            
            // 修改判断逻辑，直接使用返回的结果对象
            if (result && result._id) {
              wx.setStorageSync('specialistData', result);
              this.navigateToIndex();
            } else {
              console.error('登录返回数据异常:', result); // 添加详细错误日志
              throw new Error('登录失败，返回数据格式不正确');
            }
          })
          .catch(error => {
            wx.hideLoading();
            console.error('登录失败详情:', error); // 添加详细错误日志
            errorUtils.handleCloudError(error, '登录失败');
            this.setData({ isLoading: false });
          });
        } catch (e) {
          wx.hideLoading();
          errorUtils.showError('登录过程发生错误'); // 修改这里，使用errorUtils而不是errorHandler
          console.error('登录过程发生错误:', e);
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        console.log('用户拒绝授权:', err);
        this.setData({ isLoading: false });
        if (err.errMsg !== 'getUserProfile:fail auth deny') {
          errorUtils.showError('获取用户信息失败'); // 修改这里，使用errorUtils而不是errorHandler
        }
      }
    });
  },
  
  navigateToIndex: function() {
    wx.navigateTo({
      url: '/pages/specialist/index/userlist',
      fail: (err) => {
        console.error('页面跳转失败:', err);
        // 如果导航失败，尝试使用reLaunch
        wx.reLaunch({
          url: '/pages/specialist/index/userlist'
        });
      }
    });
  }
});