const api = require('../../../services/api');

Page({
  data: {
    qrCodeUrl: '',
    inviteCode: '',
    lastUpdateTime: null,
    statusBarHeight: 20,
    isLoading: false
  },
  
  onLoad() {
    const systemInfo = {
      ...wx.getDeviceInfo(),
      ...wx.getWindowInfo(),
      ...wx.getAppBaseInfo()
    };
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 检查本地存储中是否有缓存的二维码
    const cachedQRCode = wx.getStorageSync('specialistQRCode');
    const cachedInviteCode = wx.getStorageSync('specialistInviteCode');
    const lastUpdateTime = wx.getStorageSync('qrCodeLastUpdateTime');
    
    if (cachedQRCode && cachedInviteCode && lastUpdateTime) {
      const now = new Date();
      const lastUpdate = new Date(lastUpdateTime);
      // 如果缓存的二维码不超过24小时，直接使用
      if ((now - lastUpdate) < 24 * 60 * 60 * 1000) {
        this.setData({
          qrCodeUrl: cachedQRCode,
          inviteCode: cachedInviteCode,
          lastUpdateTime
        });
        return;
      }
    }
    
    // 没有缓存或缓存过期，生成新的二维码
    this.generateQRCode();
  },

  // 生成二维码和邀请码
  // 修改生成二维码的方法
  async generateQRCode() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '生成中...' });
    
    try {
      // 生成随机邀请码（6位数字）
      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 生成小程序码URL，直接包含邀请码参数
      // 使用第三方API生成二维码，扫码后直接跳转到小程序并带上邀请码参数
      const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + 
        encodeURIComponent(`https://minatrack.com/invite?code=${inviteCode}`);
      
      const currentTime = new Date().toISOString();
      
      // 保存到本地存储
      wx.setStorageSync('specialistQRCode', qrCodeUrl);
      wx.setStorageSync('specialistInviteCode', inviteCode);
      wx.setStorageSync('qrCodeLastUpdateTime', currentTime);
      
      this.setData({
        qrCodeUrl,
        inviteCode,
        lastUpdateTime: currentTime,
        isLoading: false
      });

      wx.hideLoading();
      
      // 可以在这里调用后端API保存邀请码与专家的关联关系
      this.saveInviteCodeToBackend(inviteCode);
    } catch (error) {
      console.error('生成二维码失败:', error);
      this.setData({ isLoading: false });
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    }
  },
  
  // 保存邀请码到后端
  async saveInviteCodeToBackend(inviteCode) {
    try {
      // 这里可以调用API将邀请码与当前专家关联
      // 例如：
      // await api.saveSpecialistInviteCode(inviteCode);
      console.log('邀请码已保存:', inviteCode);
    } catch (error) {
      console.error('保存邀请码失败:', error);
    }
  },

  // 刷新二维码
  refreshQRCode() {
    if (this.data.isLoading) return;
    
    wx.showLoading({
      title: '更新中...',
    });
    
    this.generateQRCode();
  },

  // 分享功能
  onShareAppMessage() {
    const fullInviteCode = wx.getStorageSync('specialistInviteCode') || this.data.inviteCode;
    
    return {
      title: '扫描二维码，绑定健康管理师',
      path: `/pages/user/binding/invite?inviteCode=${fullInviteCode}`,
      imageUrl: this.data.qrCodeUrl
    };
  },

  handleBack() {
    wx.navigateBack();
  }
});