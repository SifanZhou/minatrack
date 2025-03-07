# MinaTrack 小程序开发指南

## 开发环境配置

### 必要环境
- Node.js >= 14.0.0
- npm >= 6.14.0
- 微信开发者工具
- TypeScript >= 4.0.0

### 项目初始化
```bash
# 安装依赖
npm install

# 启动本地开发
npm run dev
```

## 项目结构说明

### 页面目录 (pages)
```
pages/
├── home/          # 首页
│   ├── index.ts   # 页面逻辑
│   ├── index.wxml # 页面结构
│   └── index.wxss # 页面样式
├── user/          # 用户中心
└── specialist/    # 管理师功能
```

### 工具函数 (utils)
```
utils/
├── core/          # 核心功能
│   ├── bluetooth.ts  # 蓝牙管理
│   ├── toast.ts     # 提示框
│   └── error-handler.ts # 错误处理
├── performance/   # 性能相关
└── types/        # 类型定义
```

## 开发规范

### 代码风格
1. 使用 TypeScript 开发
```typescript
// 正确示例
interface UserInfo {
  openId: string;
  nickname: string;
  avatar: string;
}

// 错误示例
const userInfo = {
  openId: 'xxx',
  nickname: 'xxx'
};
```

2. 异步处理
```typescript
// 正确示例
async function fetchData() {
  try {
    const data = await requestQueue.add({
      url: '/api/data',
      method: 'GET'
    });
    return data;
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

// 错误示例
function fetchData() {
  requestQueue.add({
    url: '/api/data',
    method: 'GET'
  }).then(data => {
    return data;
  }).catch(error => {
    console.error(error);
  });
}
```

### 页面开发

1. 页面结构
```typescript
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

2. 状态管理
```typescript
import Store from '../store';

// 更新状态
Store.setData({
  userInfo: newUserInfo
});

// 监听状态变化
Store.watch('userInfo', (newValue) => {
  this.setData({ userInfo: newValue });
});
```

## 调试技巧

### 1. 网络请求调试
```typescript
// 开启调试模式
monitor.enableDebug();

// 监听请求
monitor.onRequest(({ url, method, data }) => {
  console.log('请求参数:', { url, method, data });
});
```

### 2. 蓝牙调试
```typescript
bluetooth.onStateChange((res) => {
  console.log('蓝牙状态:', res);
});
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

1. 蓝牙连接失败
- 检查设备是否开启蓝牙
- 确认设备在范围内
- 查看错误日志

2. 请求失败
- 检查网络状态
- 验证 token 是否有效
- 查看请求参数

## 性能优化

1. 数据缓存
```typescript
// 使用缓存
const data = Cache.get('key') || await fetchData();
Cache.set('key', data);
```

2. 延迟加载
```typescript
// 使用 IntersectionObserver
const observer = wx.createIntersectionObserver();
observer.observe('.lazy-load', (res) => {
  if (res.intersectionRatio > 0) {
    // 加载数据
  }
});
```

## 安全注意事项

1. 敏感数据处理
- 不在本地存储敏感信息
- 使用 HTTPS 传输
- 及时清理缓存

2. 权限控制
- 严格校验用户权限
- 控制数据访问范围
- 记录关键操作日志