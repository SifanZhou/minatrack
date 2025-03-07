// 修改菜单项文本和对应的方法
// 调换菜单项顺序
Page({
  data: {
    userInfo: {
      name: '米娜',
      title: '管理师',
      avatar: '/images/default-avatar.png'
    },
    isSubscribed: false,
    nextRenewalDate: '',
    showSubscribePopup: false,
    menuList: [],
    statusBarHeight: 20,
    isClosing: false
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
    this.checkSubscription();
  },

  handleClose() {
    wx.navigateBack();
  },

  checkSubscription() {
    // 这里应该调用后端API检查订阅状态
    // 临时使用本地存储模拟
    const subscriptionInfo = wx.getStorageSync('subscriptionInfo') || {};
    
    this.setData({
      isSubscribed: subscriptionInfo.isSubscribed || false,
      nextRenewalDate: subscriptionInfo.nextRenewalDate || '',
      menuList: this.getMenuList(subscriptionInfo.isSubscribed)
    });
  },

  getMenuList(isSubscribed) {
    const list = [
      {
        text: '会员订阅',
        action: 'showSubscribeInfo',  // 无论是否订阅，都使用同一个方法
        rightText: isSubscribed ? `${this.data.nextRenewalDate}续期` : '',
        showButton: !isSubscribed
      }
    ];
    
    if (isSubscribed) {
      list.push({
        text: '邀请客户绑定',
        action: 'navigateToServiceCode'
      });
    }
    
    return list;
  },

  showSubscribeInfo() {
    if (this.data.isSubscribed) {
      // 已订阅状态，显示取消订阅弹窗
      this.setData({ showCancelPopup: true });
    } else {
      // 未订阅状态，显示订阅弹窗
      this.setData({ showSubscribePopup: true });
    }
  },

  // 添加关闭订阅弹窗的方法
  hideSubscribePopup() {
    this.setData({ showSubscribePopup: false });
  },

  hideCancelPopup() {
    this.setData({ showCancelPopup: false });
  },

  // 删除 navigateToSubscription 方法，因为不再需要
  navigateToSubscription() {
    wx.navigateTo({
      url: '/pages/specialist/profile/subscription'
    });
  },

  handleSubscribe() {
    wx.showLoading({ title: '处理中' });
    
    // 模拟支付过程
    setTimeout(() => {
      // 使用固定的假数据
      const nextRenewalDate = '4月15日';
      
      try {
        // 先保存到本地存储
        wx.setStorageSync('subscriptionInfo', {
          isSubscribed: true,
          nextRenewalDate
        });
        
        // 确保先设置nextRenewalDate，再生成菜单
        this.setData({
          isSubscribed: true,
          nextRenewalDate: nextRenewalDate
        }, () => {
          // 在回调中更新菜单，确保使用最新的nextRenewalDate
          this.setData({
            menuList: this.getMenuList(true),
            showSubscribePopup: false
          });
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '开通成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('订阅处理出错:', error);
        wx.hideLoading();
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
    }, 1000);
  },

  // 添加导航到服务码页面的方法
  navigateToServiceCode() {
    wx.navigateTo({
      url: '/pages/specialist/profile/servicecode'
    });
  },

  // 添加退出登录方法（如果之前没有）
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  },

  cancelSubscription() {
    wx.showModal({
      title: '提示',
      content: '确定要取消订阅吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('subscriptionInfo', {
            isSubscribed: false,
            nextRenewalDate: ''
          });
          
          this.setData({
            isSubscribed: false,
            nextRenewalDate: '',
            menuList: this.getMenuList(false),
            showCancelPopup: false  // 添加这一行，关闭取消订阅弹窗
          });

          wx.showToast({
            title: '已取消订阅',
            icon: 'success'
          });
        }
      }
    });
  },

  // 添加阻止事件冒泡的方法（用于弹窗）
  stopPropagation() {
    // 阻止事件冒泡
    return;
  }
});