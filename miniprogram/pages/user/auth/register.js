// pages/user/auth/register.js
// 引入API服务
const api = require('../../../services/api');
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
    formComplete: true  // 由于已设置默认值，表单默认完整
  },
  
  onLoad: function() {
    // 检查是否已有用户信息
    const userProfile = wx.getStorageSync('userProfile');
    if (userProfile) {
      // 设置已有的用户信息
      this.setInitialValues(userProfile);
    }
    // 检查表单是否完整
    this.checkFormComplete();
  },
  
  // 设置初始值
  setInitialValues: function(profile) {
    if (profile.gender !== undefined) {
      this.setData({
        genderIndex: profile.gender === '男' ? 0 : 1
      });
    }
    
    if (profile.age !== undefined) {
      const ageIndex = this.data.ageRange.findIndex(age => age === profile.age);
      if (ageIndex !== -1) {
        this.setData({ ageIndex });
      }
    }
    
    if (profile.height !== undefined) {
      const heightIndex = this.data.heightRange.findIndex(height => height === profile.height);
      if (heightIndex !== -1) {
        this.setData({ heightIndex });
      }
    }
    
    // 检查表单是否完整
    this.checkFormComplete();
  },
  
  // 检查表单是否完整
  checkFormComplete: function() {
    const { genderIndex, ageIndex, heightIndex } = this.data;
    const formComplete = genderIndex !== -1 && ageIndex !== -1 && heightIndex !== -1;
    this.setData({ formComplete });
  },
  
  // 性别选择器变化
  bindGenderChange: function(e) {
    this.setData({
      genderIndex: e.detail.value
    });
    this.checkFormComplete();
  },
  
  // 年龄选择器变化
  bindAgeChange: function(e) {
    this.setData({
      ageIndex: e.detail.value
    });
    this.checkFormComplete();
  },
  
  // 身高选择器变化
  bindHeightChange: function(e) {
    this.setData({
      heightIndex: e.detail.value
    });
    this.checkFormComplete();
  },
  
  // 提交表单
  handleSubmit: function() {
    if (!this.data.formComplete) {
      wx.showToast({
        title: '请完成所有选项',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.isSubmitting) return;
    
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '保存中' });
    
    const profile = {
      gender: this.data.genderRange[this.data.genderIndex],
      age: this.data.ageRange[this.data.ageIndex],
      height: this.data.heightRange[this.data.heightIndex],
      // 添加更多必要的用户信息
      nickName: '未命名用户',
      avatarUrl: '',
      hasProfile: true  // 标记用户已完善资料
    };
    
    console.log('准备提交的用户资料:', profile);
    
    // 先保存到本地
    wx.setStorageSync('userProfile', profile);
    wx.setStorageSync('userInfo', profile);  // 同时更新 userInfo
    
    // 使用更可靠的方式保存用户资料
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'updateProfile',
        profile: profile
      }
    })
    .then(res => {
      wx.hideLoading();
      console.log('云函数调用成功:', res);
      
      if (res.result && res.result.data) {
        // 保存返回的用户信息
        wx.setStorageSync('userInfo', res.result.data);
        wx.setStorageSync('userProfile', res.result.data);
      }
      
      // 延迟跳转，确保数据保存完成
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/user/index/measure'
        });
      }, 500);
    })
    .catch(error => {
      wx.hideLoading();
      console.error('云函数调用失败:', error);
      
      // 即使云端保存失败，也允许用户继续使用
      wx.showToast({
        title: '资料已保存到本地',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/user/index/measure'
        });
      }, 2000);
      
      this.setData({ isSubmitting: false });
    });
  }
});