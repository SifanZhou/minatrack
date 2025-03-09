// 模拟服务，用于本地测试
const mockService = {
  // 模拟邀请码数据
  inviteCodes: {
    'TEST001': {
      _id: 'specialist_001',
      nickName: '王医生',
      realName: '王医生',
      avatarUrl: '/images/default-avatar.png',
      company: '米娜健康',
      description: '资深健康管理师',
      specialty: '体脂管理',
      serviceType: ['体脂管理', '健康咨询'],
      phoneNumber: '13800138000'
    },
    'TEST002': {
      _id: 'specialist_002',
      nickName: '李医生',
      realName: '李医生',
      avatarUrl: '/images/default-avatar.png',
      company: '米娜健康',
      description: '专业营养师',
      specialty: '营养管理',
      serviceType: ['营养咨询', '饮食规划'],
      phoneNumber: '13900139000'
    }
  },
  
  // 获取管理师信息
  getSpecialistByInviteCode: function(inviteCode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialist = this.inviteCodes[inviteCode];
        if (specialist) {
          resolve({
            success: true,
            data: specialist
          });
        } else {
          resolve({
            success: false,
            message: '邀请码无效或已过期'
          });
        }
      }, 500); // 模拟网络延迟
    });
  },
  
  // 绑定管理师
  bindSpecialist: function(inviteCode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialist = this.inviteCodes[inviteCode];
        if (specialist) {
          // 模拟绑定成功
          resolve({
            success: true,
            data: {
              specialistId: specialist._id,
              bindTime: new Date().toISOString()
            }
          });
        } else {
          resolve({
            success: false,
            message: '邀请码无效或已过期'
          });
        }
      }, 800); // 模拟网络延迟
    });
  },
  
  // 解绑管理师
  unbindSpecialist: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true
        });
      }, 800); // 模拟网络延迟
    });
  }
};

module.exports = mockService;