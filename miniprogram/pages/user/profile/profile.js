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
    // 使用新的 API 替代废弃的 wx.getSystemInfoSync
    try {
      const systemInfo = wx.getWindowInfo();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
      // 兼容处理，使用默认值
      this.setData({
        statusBarHeight: 20
      });
    }
    
    const userInfo = wx.getStorageSync('userInfo');
    const userProfile = wx.getStorageSync('userProfile');
    
    // 检查是否已绑定管理师
    const bindingInfo = wx.getStorageSync('bindingInfo');
    if (bindingInfo && bindingInfo.specialist) {
      this.setData({
        hasTrainer: true,
        trainerInfo: {
          name: bindingInfo.specialist.name || '未知管理师',
          avatarUrl: bindingInfo.specialist.avatarUrl || '/images/default-avatar.png',
          description: bindingInfo.specialist.description || '专业健康管理师'
        }
      });
    }
    
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
    console.log('扫描结果:', result);
    wx.showLoading({ title: '正在绑定...' });
    
    // 调用云函数绑定管理师
    wx.cloud.callFunction({
      name: 'user',
      data: { 
        action: 'bind',
        inviteCode: result
      },
      success: (res) => {
        console.log('绑定结果详情:', res.result);
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 检查返回的数据结构
          let specialistInfo = null;
          
          // 根据返回结构获取专家信息
          if (res.result.data && res.result.data.specialist) {
            specialistInfo = res.result.data.specialist;
          } else if (res.result.data && res.result.data.binding) {
            // 可能是另一种数据结构
            specialistInfo = res.result.data;
          } else {
            // 直接使用返回的数据
            specialistInfo = res.result.data || {};
          }
          
          console.log('专家信息:', specialistInfo);
          
          // 更新UI状态
          this.setData({
            hasTrainer: true,
            trainerInfo: {
              name: specialistInfo.name || '未知管理师',
              avatarUrl: specialistInfo.avatarUrl || '/images/default-avatar.png',
              description: specialistInfo.description || '专业健康管理师'
            }
          });
          wx.showToast({ title: '绑定成功' });
        } else {
          wx.showToast({ 
            title: res.result?.message || '绑定失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('绑定失败:', err);
        wx.hideLoading();
        wx.showToast({ 
          title: '绑定失败',
          icon: 'error'
        });
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
  },
  
  // 添加测试绑定管理师的方法
  testBindTrainer: function() {
    // 使用一个测试邀请码，确保以 TEST_ 开头
    const testInviteCode = "TEST_123456"; // 修改为符合条件的测试码
    console.log('测试绑定管理师，使用邀请码:', testInviteCode);
    
    // 在开发环境中，可以直接模拟成功的绑定结果
    if (testInviteCode.startsWith("TEST_") || testInviteCode === "test_invite_code") {
      console.log('使用模拟数据进行测试');
      // 模拟成功的绑定结果
      const mockResult = {
        success: true,
        data: {
          specialist: {
            name: "测试管理师",
            avatarUrl: "/images/default-avatar.png",
            description: "这是一个测试用的管理师账号"
          }
        }
      };
      
      // 直接使用模拟数据更新UI
      this.setData({
        hasTrainer: true,
        trainerInfo: {
          name: mockResult.data.specialist.name,
          avatarUrl: mockResult.data.specialist.avatarUrl,
          description: mockResult.data.specialist.description
        }
      });
      
      wx.showToast({ title: '绑定成功(测试)' });
      return;
    }
    
    // 如果不是测试码，则正常调用云函数
    this.handleScanResult(testInviteCode);
  },
  
  // 改进错误处理的扫描结果处理函数
  handleScanResult: function(result) {
    console.log('扫描结果:', result);
    wx.showLoading({ title: '正在绑定...' });
    
    // 调用云函数绑定管理师
    wx.cloud.callFunction({
      name: 'user',
      data: { 
        action: 'bind',
        inviteCode: result
      },
      success: (res) => {
        console.log('绑定结果详情:', res.result);
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 检查返回的数据结构
          let specialistInfo = null;
          
          // 根据返回结构获取专家信息
          if (res.result.data && res.result.data.specialist) {
            specialistInfo = res.result.data.specialist;
          } else if (res.result.data && res.result.data.binding) {
            // 可能是另一种数据结构
            specialistInfo = res.result.data;
          } else {
            // 直接使用返回的数据
            specialistInfo = res.result.data || {};
          }
          
          console.log('专家信息:', specialistInfo);
          
          // 更新UI状态
          this.setData({
            hasTrainer: true,
            trainerInfo: {
              name: specialistInfo.name || '未知管理师',
              avatarUrl: specialistInfo.avatarUrl || '/images/default-avatar.png',
              description: specialistInfo.description || '专业健康管理师'
            }
          });
          wx.showToast({ title: '绑定成功' });
        } else {
          // 显示具体的错误信息
          const errorMsg = res.result?.message || '绑定失败';
          console.error('绑定失败原因:', errorMsg);
          
          wx.showModal({
            title: '绑定失败',
            content: errorMsg,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('绑定失败:', err);
        wx.hideLoading();
        wx.showToast({ 
          title: '绑定失败',
          icon: 'error'
        });
      }
    });
  },
  
  // 添加导航到历史记录页面的方法
  navigateToHistory: function() {
    wx.navigateTo({
      url: '/pages/user/index/history'
    });
  },
  
  handleClose: function() {
    wx.navigateBack();
  },

  // 添加基础信息编辑方法
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
  
  // 添加健康问卷方法
  healthReport: function() {
    wx.navigateTo({
      url: '/pages/user/health-report/health-report'
    });
  }

}); // Page 结束