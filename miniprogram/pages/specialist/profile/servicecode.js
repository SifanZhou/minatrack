Page({
  data: {
    qrCodeUrl: '',
    inviteCode: '',
    lastUpdateTime: null,
    statusBarHeight: 20 // 添加状态栏高度
  },
  
  onLoad() {
    // 使用新的API替代已弃用的wx.getSystemInfoSync
    const systemInfo = {
      ...wx.getDeviceInfo(),
      ...wx.getWindowInfo(),
      ...wx.getAppBaseInfo()
    };
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    this.generateQRCode();
  },

  // 添加返回方法
  handleBack() {
    wx.navigateBack();
  },
  
  onShow() {
    // 检查是否需要更新二维码
    this.checkAndUpdateQRCode();
  },
  
  // 检查并更新二维码
  checkAndUpdateQRCode() {
    const now = new Date();
    const lastUpdate = this.data.lastUpdateTime ? new Date(this.data.lastUpdateTime) : null;
    
    // 如果没有上次更新时间，或者距离上次更新已超过24小时，则更新二维码
    if (!lastUpdate || (now - lastUpdate) > 24 * 60 * 60 * 1000) {
      this.generateQRCode();
    }
  },
  
  // 生成新的二维码
  generateQRCode() {
    // 生成新的邀请码
    const inviteCode = 'EXPERT' + Date.now().toString().slice(-6);
    
    // 这里应该是调用后端API生成二维码的逻辑
    // 示例中使用模拟数据
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(`https://example.com/invite?code=${inviteCode}`);
    
    this.setData({
      qrCodeUrl: qrCodeUrl,
      inviteCode: inviteCode,
      lastUpdateTime: new Date().toISOString()
    });
    
    // 将新生成的邀请码保存到本地存储
    wx.setStorageSync('specialistInviteCode', inviteCode);
    wx.setStorageSync('qrCodeLastUpdateTime', new Date().toISOString());
  },
  
  // 手动刷新二维码
  refreshQRCode() {
    wx.showLoading({
      title: '更新中...',
    });
    
    this.generateQRCode();
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '已更新',
        icon: 'success'
      });
    }, 1000);
  },
  
  onShareAppMessage() {
    return {
      title: '扫描二维码，绑定健康管理师',
      path: `/pages/index/index?inviteCode=${this.data.inviteCode}`,
      imageUrl: this.data.qrCodeUrl
    };
  }
});