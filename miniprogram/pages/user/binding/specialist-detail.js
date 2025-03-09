// pages/user/binding/specialist-detail.js
Page({
  data: {
    specialistInfo: null,
    isLoading: false,
    fromBinding: false,
    inviteCode: '',
    fadeIn: false // 添加淡入动画控制变量
  },

  onLoad: function(options) {
    // 检查是否有邀请码参数
    if (options.code) {
      this.setData({
        fromBinding: options.fromBinding === 'true',
        inviteCode: options.code
      });
      
      // 根据邀请码获取管理师信息
      this.fetchSpecialistByCode(options.code);
    } else {
      // 尝试从页面事件通道获取数据
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('acceptSpecialistData', (data) => {
        if (data && data.specialistInfo) {
          this.setData({
            specialistInfo: data.specialistInfo
          });
          
          // 添加短暂延迟后启动淡入动画
          setTimeout(() => {
            this.setData({ fadeIn: true });
          }, 100);
        } else {
          wx.showToast({
            title: '获取管理师信息失败',
            icon: 'none'
          });
        }
      });
    }
  },
  
  // 根据邀请码获取管理师信息
  fetchSpecialistByCode: function(code) {
    // 判断是否为开发模式
    const isDevMode = true;
    
    if (isDevMode) {
      // 开发模式使用模拟数据
      setTimeout(() => {
        // 模拟获取管理师信息
        const mockSpecialist = {
          _id: 'specialist_001',
          name: '狸花三太子',
          avatarUrl: '/images/default-avatar.png',
          company: '米娜健康',
          description: '资深健康管理师',
          specialty: '体脂管理',
          serviceType: ['体脂管理', '健康咨询'],
          phoneNumber: '13800138000',
          qualification: '国家注册营养师',
          experience: '5年健康管理经验',
          cases: '已服务超过200位客户'
        };
        
        this.setData({
          specialistInfo: mockSpecialist
        });
        
        // 添加短暂延迟后启动淡入动画
        setTimeout(() => {
          this.setData({ fadeIn: true });
        }, 100);
        
        console.log('获取管理师信息成功:', mockSpecialist);
      }, 300); // 减少延迟时间
    } else {
      // 生产模式调用云函数
      wx.cloud.callFunction({
        name: 'specialist',
        data: {
          action: 'getSpecialistByInviteCode',
          inviteCode: code
        }
      }).then(res => {
        if (res.result && res.result.success && res.result.data) {
          this.setData({
            specialistInfo: res.result.data
          });
          
          // 添加短暂延迟后启动淡入动画
          setTimeout(() => {
            this.setData({ fadeIn: true });
          }, 100);
        } else {
          wx.showToast({
            title: res.result?.message || '获取管理师信息失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('获取管理师信息失败:', err);
        wx.showToast({
          title: '获取管理师信息失败',
          icon: 'none'
        });
      });
    }
  },
  
  // 确认绑定
  confirmBind: function() {
    if (!this.data.specialistInfo) {
      wx.showToast({
        title: '无法绑定，管理师信息不存在',
        icon: 'none'
      });
      return;
    }
    
    // 这里保留加载提示，因为是用户主动操作
    wx.showLoading({
      title: '绑定中...',
      mask: true
    });
    
    // 判断是否为开发模式
    const isDevMode = true; // 可以从全局配置或app实例获取
    
    if (isDevMode) {
      // 开发模式下直接模拟成功
      setTimeout(() => {
        // 保存绑定信息到本地存储
        const specialist = {
          _id: this.data.specialistInfo._id,
          name: this.data.specialistInfo.name,
          avatarUrl: this.data.specialistInfo.avatarUrl || '/images/default-avatar.png',
          description: this.data.specialistInfo.description || '专业健康管理师',
          company: this.data.specialistInfo.company || '米娜健康',
          specialty: this.data.specialistInfo.specialty || '体脂管理',
          bindTime: new Date().toISOString()
        };
        
        wx.setStorageSync('bindingInfo', {
          specialist: specialist,
          bindTime: new Date().toISOString()
        });
        
        wx.hideLoading();
        
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 1500
        });
        
        // 修改为简单的返回上一页
        setTimeout(() => {
          // 直接返回上一页（profile页面）
          wx.navigateBack({
            delta: 1
          });
        }, 1500);
      }, 1000);
    } else {
      // 生产模式调用云函数
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'bindSpecialist',
          specialistId: this.data.specialistInfo._id
        }
      }).then(res => {
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 保存绑定信息到本地存储
          const specialist = {
            _id: this.data.specialistInfo._id,
            name: this.data.specialistInfo.name,
            avatarUrl: this.data.specialistInfo.avatarUrl || '/images/default-avatar.png',
            description: this.data.specialistInfo.description || '专业健康管理师',
            company: this.data.specialistInfo.company || '米娜健康',
            specialty: this.data.specialistInfo.specialty || '体脂管理',
            bindTime: new Date().toISOString()
          };
          
          wx.setStorageSync('bindingInfo', {
            specialist: specialist,
            bindTime: new Date().toISOString()
          });
          
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1500
          });
          
          // 修改为简单的返回上一页
          setTimeout(() => {
            // 直接返回上一页（profile页面）
            wx.navigateBack({
              delta: 1
            });
          }, 1500);
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
    }
  },
  
  // 关闭页面
  handleClose: function() {
    wx.navigateBack();
  }
});