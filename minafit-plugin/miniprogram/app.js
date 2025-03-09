/**
 * 米娜体脂秤小程序示例
 * 展示如何使用VTBLE Scale SDK插件
 */

App({
  globalData: {
    userInfo: null
  },
  onLaunch() {
    console.log('App launched');
  },
  onShow() {
    console.log('App shown');
  },
  onHide() {
    console.log('App hidden');
    // 考虑在这里断开蓝牙连接
  }
});