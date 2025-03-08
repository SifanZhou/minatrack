// pages/user/auth/register.js
// 引入API服务
const api = require('../../../services/api');
const userService = require('../../../services/user');
const errorHandler = require('../../../services/error');

Page({
  data: {
    genderRange: ['男', '女'],
    genderIndex: 1,  // 默认选择女性
    ageRange: Array.from({length: 100}, (_, i) => i + 1),
    ageIndex: 24,  // 默认25岁
    heightRange: Array.from({length: 120}, (_, i) => i + 100),
    heightIndex: 60,  // 默认160cm
    isSubmitting: false,
    formComplete: true,  // 由于已设置默认值，表单默认完整
    fromProfile: false,
    submitButtonText: '完成' // 默认按钮文本
  },

  // 修改 onLoad 函数，确保正确处理来自 profile 页面的跳转
  onLoad: function(options) {
    console.log('register页面加载，参数:', JSON.stringify(options));
    
    // 首先检查本地存储中的标记，这是最高优先级
    const storedFromProfile = wx.getStorageSync('registerFromProfile');
    console.log('本地存储中的fromProfile标记:', storedFromProfile);
    
    // 检查是否从个人资料页面跳转过来
    // 增加对 options.inviteCode 的检查，避免误判
    const isFromProfile = Boolean(storedFromProfile) || (options && options.from === 'profile' && !options.inviteCode);
    console.log('是否从个人资料页面跳转:', isFromProfile);
    
    // 强制设置按钮文本和标记，并确保fromProfile标记被正确设置
    this.setData({
      fromProfile: isFromProfile,
      submitButtonText: isFromProfile ? '保存' : '完成'
    });
    
    // 如果是从profile页面来的，确保本地存储中的标记被设置
    if (isFromProfile) {
      wx.setStorageSync('registerFromProfile', true);
    }
    
    // 打印设置后的数据，用于调试
    console.log('设置后的数据:', {
      fromProfile: isFromProfile,
      submitButtonText: this.data.submitButtonText
    });
    
    // 尝试从事件通道获取数据
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('fromProfile', (data) => {
        console.log('从事件通道接收到数据:', data);
        if (data && data.from === 'profile') {
          this.setData({
            fromProfile: true,
            submitButtonText: '保存'
          });
          // 确保本地存储中的标记被设置
          wx.setStorageSync('registerFromProfile', true);
        }
      });
    }
    
    // 检查是否已有用户信息
    const userProfile = wx.getStorageSync('userProfile');
    if (userProfile) {
      // 直接设置已有的用户信息
      if (userProfile.gender !== undefined) {
        this.setData({
          genderIndex: userProfile.gender === '男' ? 0 : 1
        });
      }
      
      if (userProfile.age !== undefined) {
        const ageIndex = this.data.ageRange.findIndex(age => age === userProfile.age);
        if (ageIndex !== -1) {
          this.setData({ ageIndex });
        }
      }
      
      if (userProfile.height !== undefined) {
        const heightIndex = this.data.heightRange.findIndex(height => height === userProfile.height);
        if (heightIndex !== -1) {
          this.setData({ heightIndex });
        }
      }
    }
  },
  
  // 确保每次显示页面时都检查来源
  onShow: function() {
    // 检查是否从profile页面来
    const isFromProfile = Boolean(wx.getStorageSync('registerFromProfile'));
    console.log('onShow: 检查来源标记:', isFromProfile);
    
    if (isFromProfile) {
      console.log('onShow: 确认从个人资料页面跳转过来，设置按钮文本');
      // 强制设置按钮文本
      this.setData({
        fromProfile: true,
        submitButtonText: '保存'
      });
      
      // 打印设置后的数据，确认是否生效
      console.log('onShow 设置后的数据:', {
        fromProfile: true,
        submitButtonText: '保存'
      });
    }
    
    // 不要重复绑定事件监听，这可能导致多次处理同一事件
    // 事件监听应该只在onLoad中设置一次
  },
  
  // 性别选择器变化事件处理
  bindGenderChange: function(e) {
    this.setData({
      genderIndex: e.detail.value
    });
  },
  
  // 年龄选择器变化事件处理
  bindAgeChange: function(e) {
    this.setData({
      ageIndex: e.detail.value
    });
  },
  
  // 身高选择器变化事件处理
  bindHeightChange: function(e) {
    this.setData({
      heightIndex: e.detail.value
    });
  },
  
  // 提交表单
  // 修改 handleSubmit 函数，确保正确处理从 profile 页面进入的情况
  handleSubmit: function() {
    console.log('提交按钮被点击');
    console.log('当前页面数据:', this.data);
    console.log('按钮文本:', this.data.submitButtonText);
    console.log('fromProfile标记:', this.data.fromProfile);
    
    // 从本地存储获取来源标记
    const isFromProfile = this.data.fromProfile || Boolean(wx.getStorageSync('registerFromProfile'));
    console.log('提交时检查来源:', isFromProfile);
    
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '保存中' });
    
    // 构建用户资料对象
    const profile = {
      gender: this.data.genderRange[this.data.genderIndex],
      age: this.data.ageRange[this.data.ageIndex],
      height: this.data.heightRange[this.data.heightIndex],
      nickName: '未命名用户',
      avatarUrl: '',
      hasProfile: true
    };
    
    // 保存到本地
    wx.setStorageSync('userProfile', profile);
    wx.setStorageSync('hasCompletedRegistration', true);
    
    // 处理从个人资料页面进入的情况
    if (isFromProfile) {
      console.log('确认从个人资料页面进入，执行返回逻辑');
      
      // 先保存数据到本地
      wx.setStorageSync('userProfile', profile);
      wx.setStorageSync('hasCompletedRegistration', true);
      
      // 显示成功提示
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟返回，确保 toast 显示完成
      setTimeout(() => {
        console.log('执行返回操作');
        // 清除来源标记
        wx.removeStorageSync('registerFromProfile');
        
        // 使用 navigateBack 返回上一页
        wx.navigateBack({
          delta: 1,
          success: () => console.log('成功返回个人资料页面'),
          fail: (err) => {
            console.error('返回失败:', err);
            // 如果 navigateBack 失败，尝试使用 redirectTo
            wx.redirectTo({
              url: '/pages/user/profile/profile'
            });
          }
        });
      }, 1500);
      
      this.setData({ isSubmitting: false });
      return;
    }
    
    // 处理正常注册流程
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'updateProfile',
        profile: profile
      },
      success: () => {
        wx.reLaunch({
          url: '/pages/user/index/measure'
        });
      },
      fail: () => {
        wx.showToast({
          title: '资料已保存到本地',
          icon: 'none',
          duration: 2000,
          complete: () => {
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/user/index/measure'
              });
            }, 2000);
          }
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      }
    });
  }
});