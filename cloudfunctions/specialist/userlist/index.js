// 云函数入口文件
const cloud = require('wx-server-sdk');

// 明确指定云环境ID
cloud.init({
  env: 'minatrack-0gee1z7vf57df583'  // 修改为正确的环境ID
});
const db = cloud.database();

exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { action } = event;

    switch (action) {
      case 'list':
        return await handleUserList(OPENID, event.params);
      case 'detail':
        return await handleUserDetail(OPENID, event.params);
      case 'unbind':
        return await handleUnbind(OPENID, event.userId);
      default:
        return {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: '无效的操作类型'
          }
        };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '操作失败'
      }
    };
  }
};

async function handleUserList(openId, params) {
  const result = await db.collection('specialists')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get();

  if (!result.data.length) {
    throw {
      code: 'NOT_FOUND',
      message: '专家不存在'
    };
  }

  const specialistId = result.data[0]._id;
  const query = {
    specialistId,
    status: (params && params.status) || 'active'
  };

  const bindings = await db.collection('bindings')
    .where(query)
    .orderBy('createdAt', 'desc')
    .get();

  if (!bindings.data.length) {
    return {
      success: true,
      data: []
    };
  }

  const userIds = bindings.data.map(b => b.userId);
  const users = await db.collection('users')
    .where({
      _id: db.command.in(userIds)
    })
    .get();

  const userMap = new Map(users.data.map(u => [u._id, u]));
  const bindingList = bindings.data.map(b => ({
    ...b,
    user: userMap.get(b.userId)
  }));

  return {
    success: true,
    data: bindingList
  };
}

async function handleUserDetail(openId, params) {
  const { userId, startDate, endDate } = params;
  
  // 验证专家权限
  const result = await db.collection('bindings')
    .where({
      userId,
      specialistId: await (async function() {
        const specialistResult = await db.collection('specialists')
          .where({
            _openid: openId,
            status: 'active'
          })
          .get();
        return specialistResult.data && specialistResult.data.length > 0 ? specialistResult.data[0]._id : '';
      })(),
      status: 'active'
    })
    .get();

  if (!result.data.length) {
    throw {
      code: 'NOT_FOUND',
      message: '未找到绑定关系'
    };
  }

  // 获取用户信息
  const user = await db.collection('users')
    .doc(userId)
    .get();

  // 获取测量记录
  const query = {
    userId,
    measuredAt: {}
  };

  if (startDate) {
    query.measuredAt.$gte = startDate;
  } else {
    query.measuredAt.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  if (endDate) {
    query.measuredAt.$lte = endDate;
  }

  const measurements = await db.collection('measurements')
    .where(query)
    .orderBy('measuredAt', 'desc')
    .get();

  return {
    success: true,
    data: {
      user: user.data,
      measurements: measurements.data
    }
  };
}

async function handleUnbind(openId, userId) {
  if (!userId) {
    throw {
      code: 'INVALID_PARAMS',
      message: '缺少用户ID'
    };
  }

  const specialist = (await db.collection('specialists')
    .where({
      _openid: openId,
      status: 'active'
    })
    .get()).data[0];

  if (!specialist) {
    throw {
      code: 'NOT_FOUND',
      message: '专家不存在'
    };
  }

  const binding = await db.collection('bindings')
    .where({
      userId,
      specialistId: specialist._id,
      status: 'active'
    })
    .get();

  if (!binding.data.length) {
    throw {
      code: 'NOT_FOUND',
      message: '未找到绑定关系'
    };
  }

  await db.collection('bindings')
    .doc(binding.data[0]._id)
    .update({
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });

  return {
    success: true,
    data: { status: 'inactive' }
  };
}