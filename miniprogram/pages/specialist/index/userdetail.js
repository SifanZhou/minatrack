Page({
  data: {
    clientInfo: null,
    records: [],
    isRefreshing: false,
    statusBarHeight: 40, // 默认值
  },

  onLoad(options) {
    // 使用新的API替代已弃用的wx.getSystemInfoSync
    const systemInfo = {
      ...wx.getDeviceInfo(),
      ...wx.getWindowInfo(),
      ...wx.getAppBaseInfo()
    };
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });

    const { id } = options;
    if (!id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    // 加载真实客户数据
    this.loadClientData(id);
  },

  // 添加页面卸载事件
  onUnload() {
    // 清除可能的loading状态
    wx.hideLoading();
  },

  // 修改返回方法
  handleBack() {
    // 确保清除loading状态
    wx.hideLoading();
    wx.navigateBack({
      fail: () => {
        // 如果返回失败，直接重定向到客户列表页
        wx.redirectTo({
          url: '/pages/specialist/index/userlist'
        });
      }
    });
  },

  // 加载客户数据
  loadClientData(clientId) {
    if (!clientId) {
      wx.showToast({
        title: '客户ID不能为空',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '加载中' });
    
    // 引入客户服务
    const clientService = require('../../../services/specialist/client');
    
    // 获取客户详情
    clientService.getClientDetail(clientId)
      .then(result => {
        wx.hideLoading();
        
        if (!result) {
          throw new Error('获取客户详情失败');
        }
        
        // 处理客户基本信息
        const clientInfo = {
          id: clientId,
          name: result.name || '未知用户',
          gender: result.gender === 1 ? '男' : (result.gender === 2 ? '女' : '未知'),
          age: result.age || 0,
          height: result.height || 0,
          avatar: result.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
        };
        
        // 处理测量记录
        const records = (result.measurements || []).map(item => {
          return {
            date: this.formatTime(item.measureTime),
            weight: item.weight,
            bodyFat: item.bodyFat
          };
        });
        
        this.setData({
          clientInfo,
          records,
          isRefreshing: false
        });
      })
      .catch(error => {
        wx.hideLoading();
        console.error('获取客户详情失败:', error);
        
        // 引入错误处理服务
        const errorUtils = require('../../../services/utils/error');
        errorUtils.showError('获取客户详情失败');
        
        this.setData({ isRefreshing: false });
      });
  },

  // 格式化时间，根据日期返回相对时间描述
  formatTime(dateStr) {
    if (!dateStr) return '未知时间';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recordDate = new Date(dateStr);
    recordDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - recordDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      // 对于7天以上的日期，返回"x周前"或"x月前"
      if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}周前`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)}月前`;
      } else {
        return `${Math.floor(diffDays / 365)}年前`;
      }
    }
  },

  // 添加返回方法
  handleBack() {
    wx.navigateBack();
  },

  // 下拉刷新触发
  onRefresh() {
    // 如果已经在刷新中，则不重复触发
    if (this.data.isRefreshing) return;

    this.setData({
      isRefreshing: true,
    });

    // 重新加载客户数据
    const { id } = this.data.clientInfo;
    if (id) {
      this.loadClientData(id);
    } else {
      this.setData({ isRefreshing: false });
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    }
  }
});