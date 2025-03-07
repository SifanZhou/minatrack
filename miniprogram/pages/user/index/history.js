Page({
  data: {
    measurements: [],
    userInfo: {},
    isPageShown: false,
    testData: [
      {
        _id: 'test_1',
        weight: 55.37,
        bodyFat: 20.1,
        createdAt: new Date().toISOString(),
        relativeTime: '刚刚'
      },
      {
        _id: 'test_2',
        weight: 55.37,
        bodyFat: 20.3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        relativeTime: '今天 10:21'
      },
      {
        _id: 'test_3',
        weight: 55.37,
        bodyFat: 20.5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        relativeTime: '昨天 11:51'
      }
    ]
  },

  onLoad: function() {
    // 直接设置测试数据
    this.setData({
      measurements: this.data.testData
    });
    
    // 延迟调用云函数
    setTimeout(() => {
      this.getMeasurements();
    }, 500);
  },

  onShow: function() {
    this.setData({ 
      isPageShown: true,
      measurements: this.data.measurements.length > 0 ? this.data.measurements : this.data.testData
    });
  },

  getMeasurements: function() {
    const that = this;
    
    // 先从本地存储获取测试数据
    try {
      const cachedData = wx.getStorageSync('testMeasurements') || [];
      if (cachedData.length > 0) {
        this.setData({
          measurements: cachedData
        });
      } else {
        // 使用默认测试数据
        this.setData({
          measurements: this.data.testData
        });
      }
    } catch (e) {
      console.error('读取缓存数据失败:', e);
      // 使用默认测试数据
      this.setData({
        measurements: this.data.testData
      });
    }
    
    // 限制云函数调用频率
    if (this._lastCallTime && Date.now() - this._lastCallTime < 5000) {
      return;
    }
    
    this._lastCallTime = Date.now();
    
    // 静默调用云函数，不显示loading
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'measurements'
      }
    }).then(res => {
      if (!that.data.isPageShown) return;
      
      console.log('获取检测记录成功:', res);
      
      // 只有当云函数返回的数据数量大于1条时才更新
      if (res.result && res.result.data && res.result.data.length > 1) {
        let measurements = res.result.data;
        measurements = measurements.map(item => {
          try {
            item.relativeTime = this.getRelativeTime(item.createdAt || item.measuredAt);
          } catch (e) {
            console.error('处理时间失败:', e);
            item.relativeTime = '未知时间';
          }
          return item;
        });
        
        if (that.data.isPageShown) {
          that.setData({
            measurements: measurements
          });
          try {
            wx.setStorageSync('cloudMeasurements', measurements);
          } catch (e) {
            console.error('缓存云数据失败:', e);
          }
        }
      } else {
        console.log('云函数返回数据不足，继续使用当前数据');
      }
    }).catch(err => {
      console.error('获取记录失败:', err);
    });
  },

  getRelativeTime: function(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `今天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays === 1) {
      return `昨天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays === 2) {
      return `前天 ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else {
      return `${Math.floor(diffDays / 30)}个月前`;
    }
  },

  navigateToMeasurement: function() {
    wx.navigateTo({
      url: '/pages/user/index/measure'
    });
  },

  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/index/report?id=${id}`
    });
  }
});