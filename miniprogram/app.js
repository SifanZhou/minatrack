// app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    // 初始化云开发环境
    try {
      wx.cloud.init({
        env: 'minatrack-0gee1z7vf57df583', // 修正为正确的云环境ID
        traceUser: true,
      });
      
      console.log('云环境初始化成功');
      this.globalData.isCloudInited = true;
      
    } catch (err) {
      console.error('云开发初始化失败:', err);
    }
  },

  globalData: {
    userInfo: null,
    isCloudInited: false
  }
});