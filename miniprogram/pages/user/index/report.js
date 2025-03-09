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
        // 处理报告数据，优先使用reportData中的完整报告数据
        let reportData = data;
        
        // 如果存在完整的体脂秤报告数据，则使用它
        if (data.reportData) {
          reportData = {
            ...data,
            // 从reportData中提取关键数据
            weight: data.weight || data.reportData.weightAssessment.weight,
            bmi: data.bmi || data.reportData.weightAssessment.bmi,
            bodyFat: data.bodyFat || data.reportData.bodyComposition.bodyFat.value,
            muscle: data.muscle || data.reportData.bodyComposition.muscleMass.value,
            water: data.water || data.reportData.bodyComposition.bodyWater.value,
            bone: data.bone || data.reportData.bodyComposition.boneMass.value,
            // 添加评估和建议信息
            weightLevel: data.reportData.weightAssessment.level,
            weightSuggestion: data.reportData.weightAssessment.suggestion,
            bodyFatLevel: data.reportData.bodyComposition.bodyFat.level,
            bodyFatSuggestion: data.reportData.bodyComposition.bodyFat.suggestion,
            overallLevel: data.reportData.overallAssessment?.level,
            overallSuggestion: data.reportData.overallAssessment?.suggestion
          };
        }
        
        this.setData({
          report: {
            ...reportData,
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