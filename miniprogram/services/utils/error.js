/**
 * 错误处理工具
 */

const errorUtils = {
  /**
   * 显示错误提示
   * @param {String|Error} error 错误信息或错误对象
   * @param {String} defaultMessage 默认错误信息
   */
  showError: function(error, defaultMessage = '操作失败') {
    console.error('发生错误:', error);
    
    let message = defaultMessage;
    if (typeof error === 'string') {
      message = error;
    } else if (error && error.message) {
      message = error.message;
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },
  
  /**
   * 处理云函数错误
   * @param {Object} error 云函数错误对象
   * @param {String} defaultMessage 默认错误信息
   */
  handleCloudError: function(error, defaultMessage = '服务调用失败') {
    console.error('云函数调用失败:', error);
    
    let message = defaultMessage;
    if (error && error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '服务请求超时，请重试';
      } else if (error.errMsg.includes('network')) {
        message = '网络连接失败，请检查网络设置';
      }
    }
    
    this.showError(message);
  },
  
  /**
   * 处理业务错误
   * @param {Object} result 云函数返回结果
   * @param {String} defaultMessage 默认错误信息
   * @returns {Boolean} 是否存在错误
   */
  handleBusinessError: function(result, defaultMessage = '操作失败') {
    if (!result || !result.success) {
      const message = (result && result.error && result.error.message) || defaultMessage;
      this.showError(message);
      return true;
    }
    return false;
  }
};

module.exports = errorUtils;