Page({
  data: {
    specialistName: '', // 移除默认值，等待从API获取
    specialistAvatar: '', // 移除默认值，等待从API获取
    inviteCode: '',
    isLoading: true, // 默认显示加载状态，等待数据
    bindingComplete: false // 绑定完成状态标记
  },

  onLoad: function(options) {
    // 获取邀请码
    const inviteCode = options.inviteCode || '';
    
    if (!inviteCode) {
      wx.showToast({
        title: '邀请码无效',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ inviteCode });
    
    // 调用API获取专家信息
    this.fetchSpecialistInfo(inviteCode);
  },
  
  // 获取管理师信息
  async fetchSpecialistInfo(inviteCode) {
    try {
      this.setData({ isLoading: true });
      
      // 调用云函数获取专家信息
      const res = await wx.cloud.callFunction({
        name: 'specialist',
        data: {
          action: 'getSpecialistByInviteCode',
          inviteCode
        }
      });
      
      console.log('获取专家信息结果:', res);
      
      // 处理返回结果
      if (res.result && res.result.data) {
        const specialist = res.result.data;
        this.setData({
          specialistName: specialist.nickName || '健康管理师',
          specialistAvatar: specialist.avatarUrl || '/images/default-avatar.png',
          isLoading: false
        });
      } else {
        // 如果没有获取到数据，使用默认值
        this.setData({
          specialistName: '健康管理师',
          specialistAvatar: '/images/default-avatar.png',
          isLoading: false
        });
      }
      
    } catch (error) {
      console.error('获取管理师信息失败:', error);
      // 出错时也使用默认值
      this.setData({
        specialistName: '健康管理师',
        specialistAvatar: '/images/default-avatar.png',
        isLoading: false
      });
    }
  },
  
  // 同意绑定
  handleConfirm() {
    // 防止重复点击
    if (this.data.bindingComplete) return;
    
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    const userData = wx.getStorageSync('userData');
    
    if (!userInfo || !userData) {
      // 未登录，跳转到登录页面，携带邀请码参数
      wx.navigateTo({
        url: `/pages/user/auth/login?inviteCode=${this.data.inviteCode}`
      });
      return;
    }
    
    // 已登录，直接进行绑定
    wx.showLoading({ title: '绑定中...' });
    
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'bindSpecialist',
        inviteCode: this.data.inviteCode
      }
    }).then(res => {
      wx.hideLoading();
      
      if (res.result && res.result.success) {
        this.setData({ bindingComplete: true });
        
        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        });
        
        // 绑定成功后，跳转到首页或用户页面
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/user/index/measure'
          });
        }, 1000);
      } else {
        wx.showToast({
          title: res.result?.message || '绑定失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('绑定失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '绑定失败',
        icon: 'none'
      });
    });
  },
  
  // 取消绑定
  handleCancel() {
    wx.navigateBack();
  },
  
  // 页面卸载时清理
  onUnload() {
    // 清理可能的定时器或其他资源
  }
});