/**
 * 错误处理服务
 */
const errorHandler = {
  // 错误类型定义
  types: {
    NETWORK: 'network',
    BLUETOOTH: 'bluetooth',
    STORAGE: 'storage',
    UNKNOWN: 'unknown'
  },

  /**
   * 处理错误并显示提示
   */
  handle: function(error, type = this.types.UNKNOWN) {
    console.error(`[${type.toUpperCase()}]`, error);

    let message = '操作失败，请重试';
    
    switch (type) {
      case this.types.NETWORK:
        message = '网络连接失败，请检查网络设置';
        break;
      case this.types.BLUETOOTH:
        message = '蓝牙连接失败，请确保设备已开启';
        break;
      case this.types.STORAGE:
        message = '数据保存失败，请确保存储空间充足';
        break;
    }

    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });

    return {
      type,
      message,
      timestamp: Date.now(),
      details: error
    };
  },

  /**
   * 显示加载提示
   */
  showLoading: function(title = '加载中') {
    wx.showLoading({
      title,
      mask: true
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading: function() {
    wx.hideLoading();
  }
};

/**
 * 错误处理服务
 */
const errorCodes = {
  UNAUTHORIZED: '未授权，请重新登录',
  INVALID_PARAMS: '参数错误',
  NOT_FOUND: '资源不存在',
  SERVER_ERROR: '服务器错误',
  NETWORK_ERROR: '网络错误，请检查网络连接'
};

/**
 * 显示错误提示
 * @param {string|object} error 错误信息或错误对象
 */
function showError(error) {
  let message = '操作失败，请重试';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error && error.code && errorCodes[error.code]) {
    message = errorCodes[error.code];
  } else if (error && error.message) {
    message = error.message;
  }
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 处理API错误
 * @param {object} error 错误对象
 * @param {function} callback 回调函数
 */
function handleApiError(error, callback) {
  showError(error);
  
  if (error && error.code === 'UNAUTHORIZED') {
    // 清除登录状态
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userData');
    
    // 延迟跳转到登录页
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/user/auth/login'
      });
    }, 1500);
  }
  
  if (typeof callback === 'function') {
    callback(error);
  }
}

module.exports = {
  showError,
  handleApiError
};