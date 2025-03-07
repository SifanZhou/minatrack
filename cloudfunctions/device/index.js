// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event;
  
  switch (action) {
    case 'bind':
      return {
        success: true,
        data: {
          deviceId: 'device_123',
          name: '测试设备',
          status: 'active'
        }
      };
    case 'list':
      return {
        success: true,
        data: [
          {
            deviceId: 'device_123',
            name: '测试设备',
            status: 'active',
            lastConnected: new Date()
          }
        ]
      };
    default:
      return {
        success: false,
        error: '未知的操作类型'
      };
  }
};