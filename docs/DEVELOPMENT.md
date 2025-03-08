
# 米娜体脂管理小程序开发指南

## 环境准备
1. 安装微信开发者工具
2. 申请微信小程序账号
3. 开通云开发功能（环境ID: minatrack-0gee1z7vf57df583）

## 项目结构说明

### 页面目录 (pages)
```
pages/
├── index/          # 首页
│   ├── index.js    # 页面逻辑
│   ├── index.wxml  # 页面结构
│   └── index.wxss  # 页面样式
├── user/           # 用户端
│   ├── auth/       # 认证相关
│   ├── index/      # 主功能
│   └── profile/    # 个人资料
└── specialist/     # 管理师端
    ├── index/      # 主功能
    ├── userlist/   # 客户列表
    └── profile/    # 个人资料
```

### 服务层 (services)
```
services/
├── api.js          # API调用封装
├── storage.js      # 存储服务
├── measure.js      # 测量服务
├── sync.js         # 同步服务
└── error.js        # 错误处理
```

### 工具函数 (utils)
```
utils/
├── format.js       # 格式化工具
├── validator.js    # 数据验证
└── bluetooth.js    # 蓝牙工具
```

## 开发规范

### 页面开发
1. 页面结构
```javascript
Page({
  data: {
    // 页面数据
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  // 自定义方法
  async handleSubmit() {
    // 处理提交
  }
});
```

2. 数据处理
```javascript
// 设置数据
this.setData({
  userInfo: newUserInfo
});

// 获取数据
const { userInfo } = this.data;
```

3. 页面跳转
```javascript
// 普通跳转
wx.navigateTo({
  url: '/pages/user/profile/profile'
});

// 带参数跳转
wx.navigateTo({
  url: `/pages/user/index/report?id=${id}`
});

// 返回上一页
wx.navigateBack();
```

## 云函数开发

1. 云函数结构
```javascript
// index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: 'minatrack-0gee1z7vf57df583'
});

exports.main = async (event, context) => {
  const { action, params } = event;
  const wxContext = cloud.getWXContext();
  const OPENID = wxContext.OPENID;
  
  console.log('收到请求:', action, params);
  
  switch (action) {
    case 'list':
      return await handleList(OPENID, params);
    case 'detail':
      return await handleDetail(OPENID, params);
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

async function handleList(OPENID, params) {
  // 处理列表请求
  try {
    // 业务逻辑
    return {
      success: true,
      data: []
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    };
  }
}
```

2. 云函数部署
- 在微信开发者工具中，右键点击云函数目录
- 选择"上传并部署：云端安装依赖"

3. 错误处理
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

## 数据同步机制

1. 离线存储
```javascript
// 保存本地数据
StorageService.set('measurements', measurements);

// 标记同步状态
StorageService.set('sync_status', {
  lastSync: new Date().getTime(),
  pending: true
});
```

2. 同步到云端
```javascript
// 检查是否有待同步数据
const syncStatus = StorageService.get('sync_status');
if (syncStatus && syncStatus.pending) {
  // 获取本地数据
  const measurements = StorageService.get('measurements');
  
  // 同步到云端
  try {
    await api.callFunction('user', {
      action: 'syncMeasurements',
      data: measurements
    });
    
    // 更新同步状态
    StorageService.set('sync_status', {
      lastSync: new Date().getTime(),
      pending: false
    });
  } catch (error) {
    console.error('同步失败', error);
  }
}
```

## 发布流程

1. 代码提交
```bash
git add .
git commit -m "feat: 新功能描述"
git push
```

2. 版本发布
- 使用微信开发者工具上传代码
- 填写版本号和描述
- 提交审核

## 常见问题

1. 云函数调用失败
- 检查云函数是否已部署
- 检查云函数参数是否正确
- 查看云开发控制台日志

2. 数据同步问题
- 检查网络连接
- 确认缓存机制是否正常工作
- 验证数据格式是否正确

3. 蓝牙连接问题
- 确保设备已开启蓝牙
- 检查设备是否在可连接范围内
- 验证蓝牙权限是否已获取
- 查看蓝牙服务和特征值是否正确

4. UI 显示问题
- 检查样式是否正确应用
- 验证数据绑定是否正确
- 确认组件是否正确渲染

## 性能优化

1. 数据缓存
- 合理使用本地缓存
- 避免频繁读写缓存
- 定期清理过期缓存

2. 页面渲染
- 减少不必要的setData调用
- 避免频繁重新渲染
- 使用懒加载技术

3. 网络请求
- 合并请求减少调用次数
- 实现请求队列和重试机制
- 优先使用本地缓存数据

## 安全注意事项

1. 敏感数据处理
- 不在本地存储敏感信息
- 使用 HTTPS 传输
- 及时清理缓存

2. 权限控制
- 严格校验用户权限
- 云函数中验证用户身份
- 避免越权操作

3. 数据校验
- 前端进行基础数据校验
- 后端再次验证所有数据
- 防止SQL注入和XSS攻击

## 调试技巧

1. 日志输出
```javascript
// 前端日志
console.log('调试信息', data);

// 云函数日志
console.log('云函数调试', event);
```

2. 网络监控
- 使用开发者工具的网络面板
- 监控请求和响应
- 分析请求耗时

3. 断点调试
- 在开发者工具中设置断点
- 单步执行代码
- 查看变量值

## 项目维护

1. 代码规范
- 遵循统一的命名规范
- 保持代码格式一致
- 编写清晰的注释

2. 版本管理
- 使用语义化版本号
- 记录版本变更日志
- 保留历史版本

3. 文档更新
- 及时更新API文档
- 记录重要的实现细节
- 添加使用示例
```
