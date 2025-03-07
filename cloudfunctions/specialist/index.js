// 云函数入口文件
const cloud = require('wx-server-sdk')

// 明确指定云环境ID
cloud.init({
  env: 'minatrack-0gee1z7vf57df583'  // 修改为正确的环境ID
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, params } = event;
  const wxContext = cloud.getWXContext();
  const OPENID = wxContext.OPENID;
  
  console.log('收到请求:', action, params);
  
  try {
    switch (action) {
      case 'login':
        const db = cloud.database();
        const specialistId = 'specialist_' + OPENID;
        
        // 检查用户是否已存在
        const specialist = await db.collection('specialists')
          .where({ _openid: OPENID })
          .get()
          .then(res => res.data[0])
          .catch(() => null);

        if (!specialist) {
          // 如果用户不存在，创建新用户
          await db.collection('specialists').add({
            data: {
              _openid: OPENID,
              specialistId: specialistId,
              userInfo: event.userInfo || {},
              createdAt: new Date(),
              status: 'active',
              clientCount: 0,
              lastLoginTime: new Date()
            }
          });
        } else {
          // 更新登录时间和用户信息
          await db.collection('specialists').doc(specialist._id).update({
            data: {
              lastLoginTime: new Date(),
              userInfo: event.userInfo || specialist.userInfo
            }
          });
        }

        // 重新获取最新的用户信息
        const updatedSpecialist = await db.collection('specialists')
          .where({ _openid: OPENID })
          .get()
          .then(res => res.data[0])
          .catch(() => null);

        return {
          success: true,
          data: updatedSpecialist || {
            specialistId: specialistId,
            isNewUser: true
          }
        };

      case 'profile':
        return {
          success: true,
          data: {
            _id: 'specialist_' + OPENID,
            name: '测试专家',
            title: '营养师',
            avatar: 'https://example.com/avatar.png',
            experience: 5,
            specialty: '体重管理'
          }
        };
      case 'list':
        // 处理用户列表请求
        try {
          return await require('./userlist/index').main({
            action: 'list',
            params: params
          }, context);
        } catch (listError) {
          console.error('用户列表处理错误:', listError);
          return {
            success: false,
            error: listError instanceof Error ? listError.message : '获取用户列表失败'
          };
        }
      case 'weekly':
        // 处理周报请求
        try {
          const weeklyParams = params || { specialistId: 'specialist_' + OPENID };
          return await require('./weekly/index').main(weeklyParams);
        } catch (weeklyError) {
          console.error('周报处理错误:', weeklyError);
          return {
            success: false,
            error: weeklyError instanceof Error ? weeklyError.message : '周报生成失败'
          };
        }
      default:
        return {
          success: false,
          error: '未知的操作类型'
        };
    }
  } catch (error) {
    console.error('处理请求出错:', error);
    return {
      success: false,
      error: error.message || '操作失败'
    };
  }
};