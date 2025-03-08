# 米娜体脂管理小程序 API 文档

## 云函数 API

### 用户云函数 (user)

#### 登录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { action: 'login' }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "用户ID",
    _openid: "用户OpenID",
    status: "active",
    createdAt: "2023-01-01T00:00:00.000Z",
    lastLoginAt: "2023-01-01T00:00:00.000Z"
  }
}
```

#### 获取用户资料

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { action: 'profile' }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "用户ID",
    nickname: "用户昵称",
    height: 170,
    targetWeight: 65
    // 其他用户资料
  }
}
```

#### 更新用户资料

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { 
    action: 'profile',
    profile: {
      nickname: "用户昵称",
      height: 170,
      targetWeight: 65
      // 其他需要更新的资料
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    // 更新后的用户资料
  }
}
```

#### 获取测量记录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: {
    action: 'measurements',
    query: {
      limit: 20,
      offset: 0,
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: [
    {
      _id: "记录ID",
      weight: 70.5,
      bodyFat: 20.1,
      muscle: 54.2,
      water: 65.0,
      bone: 3.1,
      bmi: 22.5,
      measuredAt: "2023-01-01T00:00:00.000Z"
    }
    // 更多记录
  ],
  pagination: {
    total: 100,
    offset: 0,
    limit: 20
  }
}
```

#### 添加测量记录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: {
    action: 'addMeasurement',
    data: {
      weight: 70.5,
      bodyFat: 20.1,
      muscle: 54.2,
      water: 65.0,
      bone: 3.1,
      bmi: 22.5
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "新记录ID",
    // 其他记录数据
  }
}
```

#### 绑定管理师

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { 
    action: 'bind',
    inviteCode: "邀请码"
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    specialist: {
      name: "管理师姓名",
      avatarUrl: "头像URL",
      description: "专业描述"
    }
  }
}
```

### 设备云函数 (device)

#### 绑定设备

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: {
    action: 'bind',
    data: { 
      deviceId: "设备ID",
      name: "设备名称",
      model: "设备型号"
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    deviceId: "设备ID",
    name: "设备名称",
    status: "active"
  }
}
```

#### 获取设备列表

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: { action: 'list' }
})
```

**返回值**:
```javascript
{
  success: true,
  data: [
    {
      deviceId: "设备ID",
      name: "设备名称",
      status: "active",
      lastConnected: "2023-01-01T00:00:00.000Z"
    }
    // 更多设备
  ]
}
```

#### 同步设备数据

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: {
    action: 'sync',
    syncData: { 
      deviceId: "设备ID",
      measurements: [
        {
          weight: 70.5,
          bodyFat: 20.1,
          measuredAt: "2023-01-01T00:00:00.000Z"
        }
        // 更多测量数据
      ]
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    syncedCount: 1,
    measurements: [
      {
        _id: "记录ID",
        // 同步成功的测量数据
      }
    ]
  }
}
```

### 管理师云函数 (specialist)

#### 管理师登录

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: { 
    action: 'login',
    userInfo: {
      // 用户信息
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "管理师ID",
    specialistId: "管理师唯一标识",
    status: "active",
    clientCount: 10,
    lastLoginTime: "2023-01-01T00:00:00.000Z"
  }
}
```

#### 获取客户列表

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'list',
    params: { 
      status: 'active',
      limit: 20,
      offset: 0
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: [
    {
      userId: "用户ID",
      nickname: "用户昵称",
      avatarUrl: "头像URL",
      lastMeasurement: {
        weight: 70.5,
        measuredAt: "2023-01-01T00:00:00.000Z"
      },
      bindTime: "2023-01-01T00:00:00.000Z"
    }
    // 更多客户
  ]
}
```

#### 获取客户详情

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'detail',
    params: { 
      userId: "用户ID",
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    }
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    userInfo: {
      userId: "用户ID",
      nickname: "用户昵称",
      height: 170,
      targetWeight: 65
    },
    measurements: [
      // 测量记录
    ],
    statistics: {
      // 统计数据
    }
  }
}
```

#### 解绑客户

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'unbind',
    userId: "用户ID"
  }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    message: "解绑成功"
  }
}
```

## 云函数开发指南

### 云函数结构

```javascript
// index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: 'minatrack-0gee1z7vf57df583'
});

exports.main = async (event, context) => {
  const { action, params } = event;
  
  switch (action) {
    case 'list':
      return handleList(params);
    case 'detail':
      return handleDetail(params);
    default:
      return { 
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '未知的操作类型'
        }
      };
  }
};

async function handleList(params) {
  // 处理列表请求
}

async function handleDetail(params) {
  // 处理详情请求
}
```

### 云函数部署

- 在微信开发者工具中，右键点击云函数目录
- 选择"上传并部署：云端安装依赖"

### 错误处理

所有云函数应返回统一格式的响应：

```javascript
// 成功响应
{
  success: true,
  data: {
    // 响应数据
  }
}

// 错误响应
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: '错误描述'
  }
}
```

常见错误码：
- INVALID_PARAMS: 参数错误
- UNAUTHORIZED: 未授权
- NOT_FOUND: 资源不存在
- SERVER_ERROR: 服务器错误
- NETWORK_ERROR: 网络错误



# 米娜体脂管理小程序 API 文档

## 项目简介
米娜体脂管理小程序是一款专注于体重和体脂管理的微信小程序，为用户提供体重监测、数据分析和专业指导服务。小程序分为用户端和管理师端两个角色，实现了用户与健康管理师的连接。

## 项目结构
```
minatrack/
├── cloudfunctions/        # 云函数
│   ├── user/              # 用户相关云函数
│   ├── specialist/        # 管理师相关云函数
│   ├── device/            # 设备相关云函数
│   └── system/            # 系统相关云函数
├── miniprogram/           # 小程序代码
│   ├── pages/             # 页面
│   │   ├── index/         # 首页
│   │   ├── user/          # 用户端页面
│   │   └── specialist/    # 管理师端页面
│   ├── components/        # 公共组件
│   ├── services/          # 服务层
│   │   ├── api.js         # API调用
│   │   ├── storage.js     # 存储服务
│   │   ├── measure.js     # 测量服务
│   │   └── sync.js        # 同步服务
│   ├── utils/             # 工具函数
│   ├── images/            # 图片资源
│   └── app.js             # 小程序入口
└── project.config.json    # 项目配置
```

## 云函数 API

### 用户云函数 (user)

#### 登录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { action: 'login' }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "用户ID",
    _openid: "用户OpenID",
    status: "active",
    createdAt: "2023-01-01T00:00:00.000Z",
    lastLoginAt: "2023-01-01T00:00:00.000Z"
  }
}
```

#### 获取用户资料

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { action: 'profile' }
})
```

**返回值**:
```javascript
{
  success: true,
  data: {
    _id: "用户ID",
    nickname: "用户昵称",
    height: 170,
    targetWeight: 65
    // 其他用户资料
  }
}
```

#### 更新用户资料

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { 
    action: 'profile',
    profile: {
      nickname: "用户昵称",
      height: 170,
      targetWeight: 65
      // 其他需要更新的资料
    }
  }
})
```

#### 获取测量记录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: {
    action: 'measurements',
    query: {
      limit: 20,
      offset: 0,
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    }
  }
})
```

#### 添加测量记录

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: {
    action: 'addMeasurement',
    data: {
      weight: 70.5,
      bodyFat: 20.1,
      muscle: 54.2,
      water: 65.0,
      bone: 3.1,
      bmi: 22.5
    }
  }
})
```

#### 绑定管理师

```javascript
wx.cloud.callFunction({
  name: 'user',
  data: { 
    action: 'bind',
    inviteCode: "邀请码"
  }
})
```

### 设备云函数 (device)

#### 绑定设备

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: {
    action: 'bind',
    data: { 
      deviceId: "设备ID",
      name: "设备名称",
      model: "设备型号"
    }
  }
})
```

#### 获取设备列表

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: { action: 'list' }
})
```

#### 同步设备数据

```javascript
wx.cloud.callFunction({
  name: 'device',
  data: {
    action: 'sync',
    syncData: { 
      deviceId: "设备ID",
      measurements: [
        {
          weight: 70.5,
          bodyFat: 20.1,
          measuredAt: "2023-01-01T00:00:00.000Z"
        }
        // 更多测量数据
      ]
    }
  }
})
```

### 管理师云函数 (specialist)

#### 管理师登录

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: { 
    action: 'login',
    userInfo: {
      // 用户信息
    }
  }
})
```

#### 获取客户列表

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'list',
    params: { 
      status: 'active',
      limit: 20,
      offset: 0
    }
  }
})
```

#### 获取客户详情

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'detail',
    params: { 
      userId: "用户ID",
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    }
  }
})
```

#### 解绑客户

```javascript
wx.cloud.callFunction({
  name: 'specialist',
  data: {
    action: 'unbind',
    userId: "用户ID"
  }
})
```

#### 生成周报

```javascript
wx.cloud.callFunction({
  name: 'specialist/weekly',
  data: { specialistId: 'specialist_id' }
})
```

## 服务层 API

### 用户服务

```javascript
import userService from '../services/user';

// 登录
const userInfo = await userService.login();

// 注册
await userService.register({
  gender: '男',
  age: 30,
  height: 175,
  targetWeight: 70
});

// 更新资料
await userService.updateProfile({
  height: 170,
  targetWeight: 65
});

// 绑定管理师
await userService.bindTrainer('ABC123');
```

### 测量服务

```javascript
import measureService from '../services/measure';

// 添加测量记录
await measureService.addMeasurement({
  weight: 65.5,
  bodyFat: 20,
  note: '今天状态不错'
});

// 同步到服务器
await measureService.syncToServer(this, weight, localId);

// 获取历史记录
const records = await measureService.getHistory({
  limit: 10,
  offset: 0
});
```

### 存储服务

```javascript
import StorageService from '../services/storage';

// 存储数据
StorageService.set('key', value);

// 获取数据
const value = StorageService.get('key');

// 删除数据
StorageService.remove('key');
```

### 同步服务

```javascript
import SyncService from '../services/sync';

// 同步数据
await SyncService.syncData('measurements');

// 检查同步状态
const status = SyncService.getSyncStatus();
```

## 错误处理

```javascript
import errorHandler from '../services/error';

try {
  await userService.login();
} catch (error) {
  errorHandler.showError(error);
}
```

## 注意事项
1. 所有云函数调用应使用 services/api.js 中的封装方法
2. 数据同步应考虑网络状态和离线场景
3. 敏感数据不应存储在本地
4. 错误处理应统一使用 errorHandler
```
