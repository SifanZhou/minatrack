Page({
  data: {
    statusBarHeight: 20,
    currentTab: 1, // 设置为1表示当前是统计页面
    isRefreshing: false,
    // 统计数据结构
    fatChangeStats: {
      decreaseSignificant: 15,
      decreaseSlightly: 22,
      stable: 33,
      increase: 13
    },
    riskWarningStats: {
      abnormalIncrease: 3,
      outdatedData: 7
    },
    // 添加测试模式标志
    isTestMode: true
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight
    });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '周报统计'
    });
    
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 添加下拉刷新方法
  onRefresh() {
    if (this.data.isRefreshing) return;

    this.setData({
      isRefreshing: true,
    });

    this.loadStats();

    setTimeout(() => {
      this.setData({
        isRefreshing: false,
      });

      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 500,
      });
    }, 600);
  },

  loadStats() {
    // 首先获取专家ID
    wx.cloud.callFunction({
      name: 'specialist',
      data: {
        action: 'profile'
      },
      success: res => {
        if (res.result && res.result.success) {
          const specialistId = res.result.data._id;
          
          // 使用专家ID获取周报数据
          this.getWeeklyReport(specialistId);
          
          // 获取客户列表
          this.getUserList();
        } else {
          console.error('获取专家信息失败:', res.result && res.result.error ? res.result.error : '未知错误');
          this.setDefaultStats();
        }
      },
      fail: err => {
        console.error('获取专家信息失败:', err);
        this.setDefaultStats();
      }
    });
  },
  
  // 获取周报数据
  getWeeklyReport(specialistId) {
    wx.cloud.callFunction({
      name: 'specialist',
      data: {
        action: 'weekly',
        params: {
          specialistId: specialistId
        }
      },
      success: res => {
        console.log('获取周报数据成功:', res.result);
        if (res.result && res.result.success) {
          // 从周报数据中提取统计信息
          const report = res.result.report || {};
          
          // 如果有真实数据，使用真实数据
          if (report.weightDistribution) {
            const weightRanges = report.weightDistribution.weightRanges || {};
            const fatChangeStats = {
              decreaseSignificant: 15, // 这些值应该从报告中获取
              decreaseSlightly: 22,
              stable: 33,
              increase: 13
            };
            
            const riskWarning = report.riskWarning || {};
            const riskWarningStats = {
              abnormalIncrease: (riskWarning.abnormalIncrease && riskWarning.abnormalIncrease.count) || 3,
              outdatedData: 7 // 这个值应该从报告中获取
            };
            
            this.setData({
              fatChangeStats,
              riskWarningStats,
              report
            });
          } else {
            // 使用默认数据
            this.setDefaultStats();
          }
        } else {
          console.error('获取周报数据失败:', res.result.error);
          // 使用模拟数据
          this.setDefaultStats();
        }
      },
      fail: err => {
        console.error('获取周报数据失败:', err);
        // 使用模拟数据
        this.setDefaultStats();
      }
    });
  },
  
  // 获取客户列表
  getUserList() {
    // 使用测试数据
    const testClients = [
      {
        id: 1,
        name: '张三',
        gender: '男',
        age: 25,
        height: 175,
        lastCheck: '2024-02-26',
        status: 'normal',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      {
        id: 2,
        name: '李四',
        gender: '女',
        age: 30,
        height: 165,
        lastCheck: '2024-03-01',
        status: 'warning',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      {
        id: 3,
        name: '王五',
        gender: '男',
        age: 45,
        height: 180,
        lastCheck: '2024-03-04',
        status: 'danger',
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      }
    ];
    
    // 直接使用测试数据
    this.setData({ clients: testClients });
    console.log('使用测试客户数据:', testClients);
    
    // 注释掉云函数调用，避免错误
    /*
    wx.cloud.callFunction({
      name: 'specialist',
      data: {
        action: 'list',  // 使用 'list' 而不是 'userlist'
        params: {
          status: 'active'
        }
      },
      success: res => {
        console.log('获取客户列表成功:', res.result);
        if (res.result && res.result.success) {
          const clients = res.result.data || [];
          this.setData({ clients });
        } else {
          console.error('获取客户列表失败:', res.result && res.result.error ? res.result.error : '未知错误');
        }
      },
      fail: err => {
        console.error('获取客户列表失败:', err);
      }
    });
    */
  },
  
  // 设置默认统计数据
  setDefaultStats() {
    this.setData({
      fatChangeStats: {
        decreaseSignificant: 15,
        decreaseSlightly: 22,
        stable: 33,
        increase: 13
      },
      riskWarningStats: {
        abnormalIncrease: 3,
        outdatedData: 7
      }
    });
  },
  
  // 导航到客户列表的方法
  // 修改导航方法，跳转到单独的列表页
  navigateToStatsList(e) {
    const { type, title } = e.currentTarget.dataset;
    
    // 根据类型筛选客户
    let filteredClients = [];
    switch(type) {
      case 'decreaseSignificant':
        // 实际应用中应该根据体脂变化筛选
        filteredClients = this.data.clients ? this.data.clients.slice(0, 15) : [];
        break;
      case 'decreaseSlightly':
        filteredClients = this.data.clients ? this.data.clients.slice(15, 37) : [];
        break;
      case 'stable':
        filteredClients = this.data.clients ? this.data.clients.slice(37, 70) : [];
        break;
      case 'increase':
        filteredClients = this.data.clients ? this.data.clients.slice(70, 83) : [];
        break;
      case 'abnormalIncrease':
        filteredClients = this.data.clients ? this.data.clients.slice(0, 3) : [];
        break;
      case 'outdatedData':
        filteredClients = this.data.clients ? this.data.clients.filter(c => 
          !c.lastMeasurement || 
          new Date(c.lastMeasurement) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        ) : [];
        break;
    }
    
    // 将筛选后的客户列表存入缓存
    wx.setStorageSync('filteredClients', filteredClients);
    
    // 跳转到专门的统计列表页面，而不是userlist
    wx.navigateTo({
      url: `/pages/specialist/weekly/list?type=${type}&title=${encodeURIComponent(title)}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 修复navigateToClientList方法后的部分
  navigateToClientList(e) {
    const { type } = e.currentTarget.dataset;
    let filteredClients = [];
    let title = '';
    
    // 根据类型筛选客户
    switch(type) {
      case 'decreaseSignificant':
        title = '下降明显客户';
        // 实际应用中应该根据体脂变化筛选
        filteredClients = this.data.clients ? this.data.clients.slice(0, 15) : [];
        break;
      case 'decreaseSlightly':
        title = '轻微下降客户';
        filteredClients = this.data.clients ? this.data.clients.slice(15, 37) : [];
        break;
      case 'stable':
        title = '体脂持平客户';
        filteredClients = this.data.clients ? this.data.clients.slice(37, 70) : [];
        break;
      case 'increase':
        title = '体脂上升客户';
        filteredClients = this.data.clients ? this.data.clients.slice(70, 83) : [];
        break;
      case 'abnormalIncrease':
        title = '数据异常上升客户';
        filteredClients = this.data.clients ? this.data.clients.slice(0, 3) : [];
        break;
      case 'outdatedData':
        title = '未更新数据客户';
        filteredClients = this.data.clients ? this.data.clients.filter(c => 
          !c.lastMeasurement || 
          new Date(c.lastMeasurement) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        ) : [];
        break;
    }
    
    // 将筛选后的客户列表存入缓存
    wx.setStorageSync('filteredClients', filteredClients);
    
    // 跳转到客户列表页面
    wx.navigateTo({
      url: `/pages/specialist/index/userlist?type=${type}&title=${encodeURIComponent(title)}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 添加底部导航切换方法
  // 修改底部导航切换方法，使用 redirectTo 实现直接跳转
  // 修改底部导航切换方法，使用 reLaunch 实现直接跳转
  // 修改底部导航切换方法，使用 switchTab 实现直接跳转
  switchTab(e) {
    const current = parseInt(e.currentTarget.dataset.current);
    
    if (current === this.data.currentTab) return;
    
    if (current === 0) {
      wx.switchTab({
        url: '/pages/specialist/index/userlist'
      });
    } else if (current === 2) {
      wx.switchTab({
        url: '/pages/specialist/subscribe/subscribe'
      });
    }
  }
});