// 用户相关服务
const api = require('./api');
const storage = require('./storage');
const errorHandler = require('./error');

const userService = {
  // 加载用户信息
  loadUserInfo: function(page) {
    // 先尝试从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      page.setData({ userInfo });
    } else {
      // 如果本地没有用户信息，设置默认值
      const defaultUserInfo = {
        nickName: '未登录用户',
        avatarUrl: '',
        gender: 0
      };
      page.setData({ userInfo: defaultUserInfo });
    }
    
    // 检查网络状态
    wx.getNetworkType({
      success: function(res) {
        if (res.networkType === 'none') {
          console.log('当前无网络连接，使用本地缓存');
          return;
        }
        
        // 先检查登录状态
        wx.checkSession({
          success: () => {
            // session 未过期，直接获取用户信息
            api.user.getUserInfo()
              .then(userInfo => {
                if (userInfo && Object.keys(userInfo).length > 0) {
                  page.setData({ userInfo });
                  wx.setStorageSync('userInfo', userInfo);
                } else {
                  // 如果没有用户信息，跳转到注册页面
                  wx.redirectTo({
                    url: '/pages/user/auth/register'
                  });
                }
              })
              .catch(err => {
                console.error('获取用户信息失败', err);
                // 如果是新用户，跳转到注册页面
                if (err.message === '资料数据为空') {
                  wx.redirectTo({
                    url: '/pages/user/auth/register'
                  });
                }
              });
          },
          fail: () => {
            // session 已过期，重新登录
            api.user.login()
              .then(() => {
                console.log('登录成功，尝试获取用户信息');
                return api.user.getUserInfo();
              })
              .then(userInfo => {
                if (userInfo && Object.keys(userInfo).length > 0) {
                  page.setData({ userInfo });
                  wx.setStorageSync('userInfo', userInfo);
                } else {
                  console.log('用户信息为空，跳转到注册页面');
                  wx.redirectTo({
                    url: '/pages/user/auth/register'
                  });
                }
              })
              .catch(err => {
                console.error('登录或获取用户信息失败', err);
                // 如果是资料数据为空，跳转到注册页面
                if (err && (err === '资料数据为空' || err.message === '资料数据为空')) {
                  console.log('新用户，跳转到注册页面');
                  wx.redirectTo({
                    url: '/pages/user/auth/register'
                  });
                }
              });
          }
        });
      }
    });
  },

  // 处理用户点击获取信息按钮
  handleUserProfile: function(page) {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (wxUserInfo) => {
        api.user.updateProfile(wxUserInfo.userInfo)
          .then(updatedInfo => {
            if (updatedInfo) {
              page.setData({ userInfo: updatedInfo });
              wx.setStorageSync('userInfo', updatedInfo);
            }
          })
          .catch(err => {
            console.error('更新用户信息失败', err);
          });
      },
      fail: (err) => {
        console.log('获取微信用户信息失败', err);
      }
    });
  },

  // 静默更新用户信息
  silentUpdateUserInfo: function(page) {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType !== 'none') {
          api.user.getUserInfo()
            .then(userInfo => {
              if (userInfo && Object.keys(userInfo).length > 0) {
                page.setData({ userInfo });
                wx.setStorageSync('userInfo', userInfo);
              }
            })
            .catch(() => {
              console.log('静默更新用户信息失败，忽略此错误');
            });
        }
      }
    });
  },

  // 确保用户已登录
  ensureLogin: function(page, callback) {
    return new Promise((resolve, reject) => {
      // 检查本地存储中是否有用户数据
      const userData = wx.getStorageSync('userData');
      const userProfile = wx.getStorageSync('userProfile');
      const hasCompletedRegistration = wx.getStorageSync('hasCompletedRegistration');
      
      try {
        // 使用新的API组合替代已弃用的wx.getSystemInfoSync
        const appBaseInfo = wx.getAppBaseInfo();
        const isDevTools = appBaseInfo.platform === 'devtools';
        
        if (userData && userProfile && hasCompletedRegistration) {
          // 已有用户数据，直接使用本地数据
          console.log('用户已登录，检查完成');
          if (callback) callback();
          resolve(userData);
          
          // 在后台尝试刷新用户信息，但不阻塞主流程
          // 增加错误处理和重试机制
          if (!isDevTools) {
            // 使用Promise方式调用，避免未捕获的异常
            this.refreshUserDataSilently()
              .catch(err => {
                console.error('静默刷新用户数据失败:', err);
                // 设置延迟重试
                setTimeout(() => {
                  this.refreshUserDataSilently()
                    .catch(e => console.error('重试刷新用户数据失败:', e));
                }, 3000);
              });
          } else {
            console.log('开发者工具环境，跳过数据刷新');
          }
        } else {
          // 没有用户数据，需要重新登录
          console.error('用户未登录或注册未完成');
          reject(new Error('用户未登录或注册未完成'));
        }
      } catch (e) {
        console.error('检查登录状态失败:', e);
        // 出错时，尝试使用本地数据
        if (userData && userProfile && hasCompletedRegistration) {
          if (callback) callback();
          resolve(userData);
        } else {
          reject(new Error('用户未登录或注册未完成'));
        }
      }
    });
  },

  // 静默刷新用户数据
  refreshUserDataSilently: function() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType !== 'none') {
            console.log('尝试静默刷新用户数据');
            api.user.getUserInfo()
              .then(userInfo => {
                if (userInfo && Object.keys(userInfo).length > 0) {
                  wx.setStorageSync('userInfo', userInfo);
                  if (userInfo.profile) {
                    wx.setStorageSync('userProfile', userInfo.profile);
                  }
                  console.log('用户数据静默刷新成功');
                  resolve(userInfo);
                } else {
                  console.log('获取到的用户数据为空');
                  resolve(null);
                }
              })
              .catch((err) => {
                console.log('静默刷新用户数据失败，继续使用本地数据', err);
                // 失败时不做任何处理，继续使用本地数据
                resolve(null);
              });
          } else {
            console.log('无网络连接，跳过数据刷新');
            resolve(null);
          }
        },
        fail: (err) => {
          console.error('获取网络状态失败:', err);
          resolve(null);
        }
      });
    }).catch(err => {
      console.error('刷新用户数据过程中发生未捕获的错误:', err);
      return null;
    });
  },

  // 检查用户是否已完成注册
  checkUserRegistration: function() {
    return new Promise((resolve, reject) => {
      // 先检查本地存储
      const userProfile = wx.getStorageSync('userProfile');
      if (userProfile && userProfile.height) {
        resolve(true);
        return;
      }
      
      // 如果本地没有，尝试从服务器获取
      wx.getNetworkType({
        success: function(res) {
          if (res.networkType === 'none') {
            // 无网络时，如果本地没有资料，则认为未注册
            resolve(false);
            return;
          }
          
          // 尝试获取用户资料
          api.user.getUserInfo()
            .then(userInfo => {
              if (userInfo && userInfo.profile && userInfo.profile.height) {
                // 有完整资料，保存到本地并返回成功
                wx.setStorageSync('userProfile', userInfo.profile);
                resolve(true);
              } else {
                // 资料不完整，需要注册
                resolve(false);
              }
            })
            .catch(err => {
              console.error('获取用户资料失败', err);
              resolve(false);
            });
        },
        fail: function() {
          resolve(false);
        }
      });
    });
  },
  
  // 重定向到注册页面
  redirectToRegister: function() {
    wx.redirectTo({
      url: '/pages/user/auth/register'
    });
  },
  
  // 设置用户已完成注册
  setRegistrationCompleted: function(userProfile) {
    // 保存用户资料到本地
    wx.setStorageSync('userProfile', userProfile);
    // 设置注册完成标记
    wx.setStorageSync('hasCompletedRegistration', true);
  }
};

module.exports = userService;