// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { action } = event;
    
    return {
      success: true,
      data: {
        message: '系统云函数调用成功',
        action: action || 'default'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};