Page({
  data: {
    report: null,
    loading: true,
    fromMeasure: false
  },

  onLoad: function(options) {
    const { id, fromMeasure } = options;
    
    // 设置来源标记
    this.setData({
      fromMeasure: fromMeasure === 'true'
    });
    
    // 如果是从测量页面来的，隐藏导航栏
    if (fromMeasure === 'true') {
      wx.hideHomeButton();
    }

    if (!id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }
    
    this.loadReport(id);
  },

  loadReport: function(id) {
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'measurement',
        measurementId: id
      }
    }).then(res => {
      const { data } = res.result;
      if (data) {
        this.setData({
          report: {
            ...data,
            createdAt: this.formatDate(new Date(data.createdAt))
          },
          loading: false
        });
      }
    }).catch(err => {
      console.error('获取报告详情失败:', err);
      wx.showToast({
        title: '获取报告失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    });
  },

  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  
  // 修改返回处理
  handleBack: function() {
    if (this.data.fromMeasure) {
      wx.redirectTo({
        url: '/pages/user/index/measure'
      });
    } else {
      wx.navigateBack();
    }
  },
  
  onShareAppMessage: function() {
    return {
      title: `我的体重记录: ${this.data.report?.weight}kg`,
      path: `/pages/user/measurement/report?id=${this.data.report?._id}`
    };
  }
});