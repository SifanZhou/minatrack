// pages/user/binding/binding.js
Page({
  data: {
    isLoading: true,
    specialistInfo: null,
    specialistName: '',
    specialistAvatar: '',
    bindingComplete: false,
    errorMessage: ''
  },

  onLoad: function(options) {
    // 检查是否有邀请码参数
    if (options.code) {
      // 获取管理师信息
      this.fetchSpecialistByCode(options.code);
    } else {
      this.setData({
        isLoading: false,
        errorMessage: '缺少邀请码参数'
      });
    }
  },
  
  // 根据邀请码获取管理师信息
  fetchSpecialistByCode: function(code) {
    wx.showLoading({ title: '加载中...' });
    
    // 判断是否为开发模式
    const isDevMode = true; // 可以从全局配置或app实例获取
    
    if (isDevMode) {
      // 开发模式下，直接跳转到管理师详情页
      setTimeout(() => {
        wx.hideLoading();
        console.log('准备跳转到管理师详情页，邀请码:', code);
        
        // 使用redirectTo替代navigateTo
        wx.redirectTo({
          url: `/pages/user/binding/specialist-detail?code=${code}&fromBinding=true`,
          success: function() {
            console.log('跳转到管理师详情页成功');
          },
          fail: function(error) {
            console.error('跳转到管理师详情页失败:', error);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }, 500);
    } else {
      // 生产模式下，先验证邀请码，然后跳转到详情页
      wx.cloud.callFunction({
        name: 'specialist',
        data: {
          action: 'verifyInviteCode',
          inviteCode: code
        }
      }).then(res => {
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 邀请码有效，跳转到详情页
          wx.redirectTo({
            url: `/pages/user/binding/specialist-detail?code=${code}&fromBinding=true`,
            success: function() {
              console.log('跳转到管理师详情页成功');
            },
            fail: function(error) {
              console.error('跳转到管理师详情页失败:', error);
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        } else {
          // 邀请码无效
          this.setData({
            isLoading: false,
            errorMessage: res.result?.message || '邀请码无效或已过期'
          });
        }
      }).catch(err => {
        console.error('验证邀请码失败:', err);
        wx.hideLoading();
        this.setData({
          isLoading: false,
          errorMessage: '验证邀请码失败'
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
          name: this.data.specialistName,
          avatarUrl: this.data.specialistAvatar,
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
        this.setData({
          bindingComplete: true
        });
        
        // 修改这里：直接使用 setTimeout 而不是嵌套在 showToast 的回调中
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 1500
        });
        
        // 单独设置延时返回
        setTimeout(() => {
          wx.navigateBack();
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
            name: this.data.specialistName,
            avatarUrl: this.data.specialistAvatar,
            description: this.data.specialistInfo.description || '专业健康管理师',
            company: this.data.specialistInfo.company || '米娜健康',
            specialty: this.data.specialistInfo.specialty || '体脂管理',
            bindTime: new Date().toISOString()
          };
          
          wx.setStorageSync('bindingInfo', {
            specialist: specialist,
            bindTime: new Date().toISOString()
          });
          
          this.setData({
            bindingComplete: true
          });
          
          // 修改这里：直接使用 setTimeout 而不是嵌套在 showToast 的回调中
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1500
          });
          
          // 单独设置延时返回
          setTimeout(() => {
            wx.navigateBack();
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
  
  // 取消绑定
  cancelBind: function() {
    wx.navigateBack();
  },
  
  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },
  
  // 查看管理师详情
  viewSpecialistDetail: function() {
    if (!this.data.specialistInfo) return;
    
    wx.navigateTo({
      url: '/pages/user/binding/specialist-detail',
      success: (res) => {
        res.eventChannel.emit('acceptSpecialistData', {
          specialistInfo: this.data.specialistInfo
        });
      }
    });
  }
});