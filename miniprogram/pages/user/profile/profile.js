Page({
  data: {
    userInfo: null,
    userProfile: null,
    loading: true,
    hasTrainer: false,
    trainerInfo: null,
    // 添加管理师相关数据
    hasSpecialist: false,
    specialistInfo: null,
    specialistName: '',
    specialistAvatar: '',
    statusBarHeight: 0,
    isDevMode: true
  },

  onLoad: function() {
    // 获取状态栏高度
    try {
      const systemInfo = wx.getWindowInfo();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
      this.setData({
        statusBarHeight: 20
      });
    }
    
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    
    // 检查是否已绑定管理师
    this.checkBindingInfo();
    
    this.setData({
      userInfo,
      userProfile,
      loading: false
    });
  },
  
  // 页面显示时检查绑定信息
  onShow: function() {
    // 检查绑定信息
    this.checkBindingInfo();
    
    // 刷新用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    
    this.setData({
      userInfo,
      userProfile
    });
  },
  
  // 添加检查绑定信息的方法
  checkBindingInfo: function() {
    try {
      // 从本地存储获取绑定信息
      const bindingInfo = wx.getStorageSync('bindingInfo');
      
      if (bindingInfo && bindingInfo.specialist) {
        // 如果有绑定信息，更新页面数据
        this.setData({
          hasSpecialist: true,
          hasTrainer: true, // 同时更新旧的状态变量，保持兼容
          specialistInfo: bindingInfo.specialist,
          trainerInfo: bindingInfo.specialist, // 同时更新旧的状态变量，保持兼容
          specialistName: bindingInfo.specialist.name || '健康管理师',
          specialistAvatar: bindingInfo.specialist.avatarUrl || '/images/default-avatar.png'
        });
        console.log('已加载管理师信息:', bindingInfo.specialist);
      } else {
        // 如果没有绑定信息
        this.setData({
          hasSpecialist: false,
          hasTrainer: false,
          specialistInfo: null,
          trainerInfo: null,
          specialistName: '',
          specialistAvatar: ''
        });
        console.log('未找到管理师绑定信息');
      }
    } catch (error) {
      console.error('检查绑定信息出错:', error);
      // 出错时设置为未绑定状态
      this.setData({
        hasSpecialist: false,
        hasTrainer: false,
        specialistInfo: null,
        trainerInfo: null,
        specialistName: '',
        specialistAvatar: ''
      });
    }
  },
  
  editProfile: function() {
    wx.navigateTo({
      url: '/pages/user/auth/register'
    });
  },

  // 绑定管理师 - 统一函数名
  bindSpecialist: function() {
    // 调用微信扫码API
    wx.scanCode({
      onlyFromCamera: true, // 只允许从相机扫码
      scanType: ['qrCode'], // 只扫描二维码
      success: (res) => {
        console.log('扫码成功:', res);
        // 解析扫码结果，获取邀请码
        try {
          let inviteCode = '';
          
          // 处理扫码结果，可能是完整URL或直接是邀请码
          if (res.result) {
            // 如果是URL，尝试从中提取邀请码
            if (res.result.includes('code=')) {
              // 提取code参数
              const codeMatch = res.result.match(/[?&]code=([^&]+)/);
              inviteCode = codeMatch ? codeMatch[1] : '';
            } else if (res.result.includes('inviteCode=')) {
              // 提取inviteCode参数
              const codeMatch = res.result.match(/[?&]inviteCode=([^&]+)/);
              inviteCode = codeMatch ? codeMatch[1] : '';
            } else {
              // 假设扫码结果直接是邀请码
              inviteCode = res.result;
            }
            
            // 如果成功获取邀请码，跳转到绑定页面
            if (inviteCode) {
              wx.navigateTo({
                url: `/pages/user/binding/binding?code=${inviteCode}`
              });
            } else {
              wx.showToast({
                title: '无效的二维码',
                icon: 'error'
              });
            }
          }
        } catch (error) {
          console.error('解析二维码失败:', error);
          wx.showToast({
            title: '无效的二维码',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        // 用户取消扫码不提示错误
        if (err.errMsg !== "scanCode:fail cancel") {
          wx.showToast({
            title: '扫码失败',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 保留旧的函数名以兼容现有代码
  bindTrainer: function() {
    this.bindSpecialist();
  },

  // 查看管理师详情
  viewSpecialistDetail: function() {
    if (!this.data.hasSpecialist) {
      return;
    }
    
    // 直接跳转，不显示额外的加载提示
    wx.navigateTo({
      url: '/pages/user/binding/specialist-detail',
      success: (res) => {
        // 传递管理师信息到详情页
        res.eventChannel.emit('acceptSpecialistData', { 
          specialistInfo: this.data.specialistInfo 
        });
      }
    });
  },
  
  // 保留旧的函数名以兼容现有代码
  viewTrainerInfo: function() {
    this.viewSpecialistDetail();
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
  },
  
  // 导航到历史记录页面
  navigateToHistory: function() {
    wx.navigateTo({
      url: '/pages/user/index/history'
    });
  },
  
  handleClose: function() {
    wx.navigateBack();
  },

  // 基础信息编辑方法
  editBasicInfo: function() {
    console.log('跳转到基础信息编辑页面');
    
    // 先清除之前可能存在的标记
    wx.removeStorageSync('registerFromProfile');
    
    // 设置新的标记，确保值为 true
    wx.setStorageSync('registerFromProfile', true);
    console.log('已设置 registerFromProfile = true，当前值:', wx.getStorageSync('registerFromProfile'));
    
    // 使用 navigateTo 而不是 redirectTo 或 reLaunch
    wx.navigateTo({
      url: '/pages/user/auth/register?from=profile&t=' + Date.now(),
      success: (res) => {
        console.log('成功跳转到编辑页面');
        // 确保页面已经打开后再发送事件
        if (res.eventChannel) {
          // 立即发送事件，不使用setTimeout
          res.eventChannel.emit('fromProfile', { from: 'profile', isEdit: true });
          console.log('已通过事件通道发送数据');
        } else {
          console.error('无法获取事件通道');
          // 确保标记被设置，即使没有事件通道
          wx.setStorageSync('registerFromProfile', true);
          console.log('无事件通道，再次设置 registerFromProfile = true');
        }
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        // 如果navigateTo失败，尝试使用redirectTo
        wx.setStorageSync('registerFromProfile', true);
        console.log('跳转失败，再次设置 registerFromProfile = true');
        wx.redirectTo({
          url: '/pages/user/auth/register?from=profile&t=' + Date.now()
        });
      }
    });
  },
  
  // 健康问卷方法
  healthReport: function() {
    wx.navigateTo({
      url: '/pages/user/health-report/health-report'
    });
  },
  
  // 解绑管理师
  unbindTrainer: function() {
    wx.showModal({
      title: '解绑管理师',
      content: '解绑可能会影响管理师为您提供更好的服务体验，是否继续？',
      confirmColor: '#07C160',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '解绑中',
            mask: true
          });
          
          // 根据开发模式选择服务
          if (this.data.isDevMode) {
            // 开发模式下直接模拟成功
            setTimeout(() => {
              wx.hideLoading();
              // 更新UI状态
              this.setData({
                hasTrainer: false,
                hasSpecialist: false,
                trainerInfo: null,
                specialistInfo: null,
                specialistName: '',
                specialistAvatar: ''
              });
              
              // 清除本地存储的绑定信息
              wx.removeStorageSync('bindingInfo');
              
              wx.showToast({ 
                title: '解绑成功(测试)',
                icon: 'success'
              });
            }, 800);
          } else {
            // 生产模式调用云函数
            wx.cloud.callFunction({
              name: 'user',
              data: { 
                action: 'unbind'
              },
              success: (res) => {
                wx.hideLoading();
                
                if (res.result && res.result.success) {
                  // 更新UI状态
                  this.setData({
                    hasTrainer: false,
                    hasSpecialist: false,
                    trainerInfo: null,
                    specialistInfo: null,
                    specialistName: '',
                    specialistAvatar: ''
                  });
                  
                  // 清除本地存储的绑定信息
                  wx.removeStorageSync('bindingInfo');
                  
                  wx.showToast({ 
                    title: '解绑成功',
                    icon: 'success'
                  });
                } else {
                  wx.showToast({ 
                    title: res.result?.message || '解绑失败',
                    icon: 'error'
                  });
                }
              },
              fail: (err) => {
                console.error('解绑失败:', err);
                wx.hideLoading();
                wx.showToast({ 
                  title: '解绑失败',
                  icon: 'error'
                });
              }
            });
          }
        }
      }
    });
  },

  // 测试方法 - 手动输入邀请码
  testBindWithCode: function() {
    wx.showModal({
      title: '测试绑定',
      editable: true,
      placeholderText: '请输入邀请码',
      success: (res) => {
        if (res.confirm && res.content) {
          const inviteCode = res.content.trim();
          wx.navigateTo({
            url: `/pages/user/binding/binding?code=${inviteCode}`
          });
        }
      }
    });
  },

  // 测试方法 - 使用模拟数据
  testBindWithMockData: function() {
    // 模拟管理师数据
    const mockSpecialistData = {
      _id: 'mock_specialist_id_' + Date.now(),
      name: '测试管理师',
      avatarUrl: '/images/default-avatar.png',
      description: '这是一个测试用的管理师账号',
      company: '米娜健康',
      specialty: '体脂管理',
      serviceType: ['体脂管理', '健康咨询'],
      bindTime: new Date().toISOString()
    };
    
    // 更新本地状态
    this.setData({
      hasTrainer: true,
      hasSpecialist: true,
      trainerInfo: mockSpecialistData,
      specialistInfo: mockSpecialistData,
      specialistName: mockSpecialistData.name,
      specialistAvatar: mockSpecialistData.avatarUrl
    });
    
    // 保存到本地存储
    wx.setStorageSync('bindingInfo', {
      specialist: mockSpecialistData,
      bindTime: mockSpecialistData.bindTime
    });
    
    wx.showToast({
      title: '绑定成功(模拟)',
      icon: 'success'
    });
  }
}); // Page 结束