// 引入服务模块
const clientService = require('../../../services/specialist/client');
const statsService = require('../../../services/specialist/stats');
const timeUtil = require('../../../services/utils/time');
// 添加错误处理工具引用
const errorUtils = require('../../../services/utils/error');

// 专家端用户列表页面
// 已经引入了客户服务，不需要重复引入

Page({
  data: {
    clients: [
      // 保留原有的客户数据
      {
        id: 1,
        name: '张三',
        gender: '男',
        age: 25,
        height: 175,
        lastCheck: '2024-02-26',
        status: 'normal',
        avatar:
          'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      // 添加更多测试数据
      {
        id: 2,
        name: '李四',
        gender: '女',
        age: 30,
        height: 165,
        lastCheck: '2024-03-01',
        status: 'warning',
        avatar:
          'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      },
      {
        id: 3,
        name: '王五',
        gender: '男',
        age: 45,
        height: 180,
        lastCheck: '2024-03-04',
        status: 'danger',
        avatar:
          'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      }
    ],
    currentTab: 0,
    isRefreshing: false,
    isLoading: false,
    isSubscribed: true,
    nextRenewalDate: '3月15日',
    statusBarHeight: 20,  // 状态栏高度
    customNavBarHeight: 44, // 自定义导航栏高度
    // 添加用户头像信息
    userAvatar: '/images/default-avatar.png',
    // 添加测试模式标志
    isTestMode: true,
    // 添加统计数据
    stats: {
      totalClients: 0,
      activeClients: 0,
      warningClients: 0,
      dangerClients: 0,
      recentMeasurements: []
    }
  },

  // 添加时间处理函数
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

  // 修改 onLoad 方法，处理时间显示
  onLoad() {
    // 替换已弃用的 getSystemInfoSync
    const systemInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });

    // 其余代码保持不变
    // 获取用户头像
    const specialistInfo = wx.getStorageSync('specialistInfo') || {};
    if (specialistInfo.avatarUrl) {
      this.setData({
        userAvatar: specialistInfo.avatarUrl
      });
    }

    // 处理客户数据中的时间显示
    const clients = this.data.clients.map(client => ({
      ...client,
      lastCheck: this.getRelativeTime(client.lastCheck)
    }));

    this.setData({ clients });
    
    this.loadStats();
    this.updateTitle();
    this.checkSubscription();
    
    console.log('客户数据:', this.data.clients);
  },

  // 修复云函数调用的语法
  loadRealClients() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中' });
    
    clientService.getClientList({ status: 'active' }, this.data.isRefreshing)
      .then(clients => {
        wx.hideLoading();
        this.setData({ 
          clients,
          isLoading: false,
          isRefreshing: false
        });
        this.loadStats();
      })
      .catch(error => {
        wx.hideLoading();
        errorUtils.handleCloudError(error, '获取客户列表失败');
        this.setData({ 
          isLoading: false,
          isRefreshing: false
        });
      });
  },

  // 添加计算客户状态的辅助方法
  calculateClientStatus(userData) {
    // 这里可以根据实际业务逻辑计算状态
    // 例如：根据最近测量数据判断
    return 'normal'; // 默认返回 normal
  },

  // 删除这个onShow方法，因为下面已经有一个更完整的onShow方法
  // onShow() {
  //   this.updateTitle();
  //   this.checkSubscription();
  // },

  navigateToStatsList(e) {
    const { type, title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/specialist/weekly/list?type=${type}&title=${title}`,
    });
  },
  
  navigateToSubscribe() {
    wx.navigateTo({
      url: '/pages/specialist/subscribe/subscribe',
    });
  },
  
  showServiceCode() {
    wx.showModal({
      title: '服务码',
      content: 'EXPERT12345',
      showCancel: false,
      confirmText: '复制',
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'EXPERT12345',
            success() {
              wx.showToast({
                title: '已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },
  
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }
      }
    });
  },

  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    if (this.data.currentTab === tab) return;
    
    // 如果切换到统计页面，跳转到统计页
    if (tab === 1) {
      wx.navigateTo({
        url: '/pages/specialist/weekly/weekly',
        fail: (err) => {
          console.error('跳转到统计页面失败:', err);
        }
      });
      return;
    }
    
    this.setData({
      currentTab: tab,
    });
    
    this.updateTitle();
  },
  
  // 添加统计数据加载方法
  loadStats() {
    // 使用服务模块计算统计数据
    statsService.calculateStats(this.data.clients)
      .then(stats => {
        this.setData({ stats });
      })
      .catch(error => {
        console.error('计算统计数据失败:', error);
        // 使用本地计算作为后备
        const clients = this.data.clients || [];
        const stats = {
          totalClients: clients.length,
          activeClients: clients.filter(c => !timeUtil.isOlderThan(c.lastCheck, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).length,
          warningClients: clients.filter(c => c.status === 'warning').length,
          dangerClients: clients.filter(c => c.status === 'danger').length,
          recentMeasurements: clients
            .filter(c => c.lastCheck && c.lastCheck !== '暂无数据')
            .sort((a, b) => timeUtil.compareRelativeTimes(b.lastCheck, a.lastCheck))
            .slice(0, 5)
        };
        
        this.setData({ stats });
      });
  },

  // 修改刷新方法，使用服务模块
  onRefresh() {
    if (this.data.isRefreshing) return;
    
    this.setData({ isRefreshing: true });
    
    // 强制刷新客户列表
    this.loadRealClients();
  },
  
  // 修改onShow方法，避免重复定义
  onShow() {
    // 检查是否需要刷新数据
    const lastUpdate = wx.getStorageSync('lastClientUpdate');
    const now = Date.now();
    if (!lastUpdate || (now - lastUpdate > 5 * 60 * 1000)) {
      this.loadRealClients();
      wx.setStorageSync('lastClientUpdate', now);
    }
    
    this.updateTitle();
    this.checkSubscription();
  },

  // 修改筛选方法，使用时间工具
  navigateToClientList(e) {
    const { type } = e.currentTarget.dataset;
    let filteredClients = [];
    let title = '';
    
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    switch(type) {
      case 'all':
        filteredClients = this.data.clients;
        title = '全部客户';
        break;
      case 'active':
        filteredClients = this.data.clients.filter(c => 
          !timeUtil.isOlderThan(c.lastCheck, oneWeekAgo)
        );
        title = '活跃客户';
        break;
      case 'warning':
        filteredClients = this.data.clients.filter(c => c.status === 'warning');
        title = '警告客户';
        break;
      case 'danger':
        filteredClients = this.data.clients.filter(c => c.status === 'danger');
        title = '危险客户';
        break;
    }
    
    // 保存原始客户列表
    this.setData({
      originalClients: this.data.clients,
      clients: filteredClients,
      currentTab: 0,
      filterTitle: title,
      isFiltered: true
    });
    
    // 更新标题
    this.updateTitle();
  },
  
  // 添加返回全部客户的方法
  resetClientFilter() {
    if (!this.data.isFiltered) return;
    
    this.setData({
      clients: this.data.originalClients,
      isFiltered: false,
      filterTitle: ''
    });
    
    this.updateTitle();
  },
  
  checkSubscription() {
    this.setData({
      isSubscribed: true,
      nextRenewalDate: '3月15日',
    });
  },

  // 移除原来的 updateTitle 方法，因为我们不再使用系统导航栏
  updateTitle() {
    // 不再调用 wx.setNavigationBarTitle
    // 只更新客户数量
    this.setData({
      clientCount: this.data.clients ? this.data.clients.length : 0
    });
  },

  // 添加测试功能
  // 添加测试客户方法
  addTestClient() {
    const result = clientService.addTestClient();
    
    this.setData({
      clients: result.clients,
      isLoading: false,
      isRefreshing: false
    });
    
    this.loadStats();
    this.updateTitle();
    
    wx.showToast({
      title: '已添加测试客户',
      icon: 'success'
    });
  },
  
  clearTestClients() {
    wx.showModal({
      title: '清空测试数据',
      content: '确定要清空所有客户数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            clients: []
          });
          
          this.updateTitle();
          
          wx.showToast({
            title: '已清空客户数据',
            icon: 'success'
          });
        }
      }
    });
  },

  // 修改客户详情页跳转方法
  viewClientDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/specialist/index/userdetail?id=${id}`,
      fail: (err) => {
        console.error('跳转到客户详情页失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 添加跳转到个人资料页面的方法
  navigateToProfile() {
    wx.navigateTo({
      url: '/pages/specialist/profile/profile'
    });
  },

  // 删除这个重复的onRefresh方法
  // onRefresh() {
  //   if (this.data.isRefreshing) return;
  //
  //   this.setData({
  //     isRefreshing: true,
  //   });
  //
  //   setTimeout(() => {
  //     this.setData({
  //       isRefreshing: false,
  //     });
  //
  //     wx.showToast({
  //       title: '刷新成功',
  //       icon: 'none',
  //       duration: 500,
  //     });
  //   }, 600);
  // }
});