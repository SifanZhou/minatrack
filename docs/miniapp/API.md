# 米娜体脂管理小程序文档

## 项目简介
米娜体脂管理小程序是一款专注于体重和体脂管理的微信小程序，为用户提供体重监测、数据分析和专业指导服务。小程序分为用户端和专家端两个角色，实现了用户与健康管理专家的连接。

## 项目结构
```
minatrack/
├── cloudfunctions/        # 云函数
│   ├── user/              # 用户相关云函数
│   ├── specialist/        # 专家相关云函数
│   └── bindTrainer/       # 绑定专家云函数
├── miniprogram/           # 小程序代码
│   ├── pages/             # 页面
│   │   ├── index/         # 首页
│   │   ├── user/          # 用户端页面
│   │   └── specialist/    # 专家端页面
│   ├── components/        # 公共组件
│   ├── services/          # 服务层
│   │   ├── api.js         # API调用
│   │   ├── storage.js     # 存储服务
│   │   ├── user/          # 用户服务
│   │   └── specialist/    # 专家服务
│   ├── utils/             # 工具函数
│   ├── images/            # 图片资源
│   └── app.js             # 小程序入口
└── project.config.json    # 项目配置
```

## 核心功能

### 1. 用户功能
- 用户注册与登录
- 体重测量记录
- 历史数据查看
- 专家绑定

### 2. 专家功能
- 客户管理
- 数据分析
- 会员订阅
- 邀请码管理

### 3. 数据同步
- 离线数据存储
- 云端数据同步
- 缓存机制

## 开发规范
1. 代码规范
   - 使用微信小程序原生框架
   - 遵循模块化开发
   - 保持代码简洁清晰

2. 测试规范
   - 编写单元测试
   - 保持测试独立性
   - 合理使用 mock

3. 文档规范
   - 及时更新文档
   - 注释关键代码
   - 记录重要变更

## 相关文档
- [API 使用说明](./API.md)
- [开发指南](./DEVELOPMENT.md)
- [测试文档](./TESTING.md)

## 注意事项
1. 开发前请先阅读完整文档
2. 遵循代码提交规范
3. 确保测试用例完整
4. 注意数据安全性
```

### 更新 API.md

```markdown:/Users/Sifan/Project/WeChatProjects/minatrack/docs/miniapp/API.md
# 米娜体脂管理小程序 API 使用说明

## 用户功能

### 登录与注册
```javascript
// 登录
const userInfo = await userService.login();

// 注册
await userService.register({
  gender: '男',
  age: 30,
  height: 175,
  targetWeight: 70
});
```

### 更新资料
```javascript
await userService.updateProfile({
  height: 170,
  targetWeight: 65
});
```

### 绑定专家
```javascript
await userService.bindSpecialist('ABC123');
```

### 测量记录
```javascript
// 添加记录
await userService.addMeasurement({
  weight: 65.5,
  bodyFat: 20,
  note: '今天状态不错'
});

// 删除记录
await userService.deleteMeasurement('record_id');

// 查询历史记录
const records = await userService.getMeasurements({
  limit: 10,
  offset: 0,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});
```

## 专家功能

### 专家登录
```javascript
// 登录
const specialistInfo = await specialistService.login();
```

### 更新资料
```javascript
await specialistService.updateProfile({
  nickName: '张医生',
  avatarUrl: 'https://...'
});
```

### 客户管理
```javascript
// 获取客户列表
const clients = await specialistService.getClientList({
  status: 'active',
  limit: 10,
  offset: 0
});

// 获取客户详情
const clientDetail = await specialistService.getClientDetail('client_id', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});

// 解绑客户
await specialistService.unbindClient('client_id');
```

### 邀请码管理
```javascript
const inviteCode = await specialistService.generateInviteCode();
```

### 订阅服务
```javascript
await specialistService.subscribe({
  months: 1,
  autoRenew: false
});
```

### 数据分析
```javascript
const clientStats = await specialistService.getClientStats('client_id');
```

## 工具函数

### 错误处理
```javascript
import { errorHandler } from '../services/utils/error';

try {
  await userService.login();
} catch (error) {
  errorHandler.showError('登录失败');
}
```

### 存储服务
```javascript
import storage from '../services/storage';

// 存储数据
storage.set('key', value);

// 获取数据
const value = storage.get('key');

// 删除数据
storage.remove('key');
```

### 云函数调用
```javascript
import api from '../services/api';

const result = await api.callFunction('functionName', {
  action: 'actionName',
  params: {}
});
```
```

### 更新 DEVELOPMENT.md

```markdown:/Users/Sifan/Project/WeChatProjects/minatrack/docs/miniapp/DEVELOPMENT.md
# 米娜体脂管理小程序开发指南

## 环境准备
1. 安装微信开发者工具
2. 申请微信小程序账号
3. 开通云开发功能

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
└── specialist/     # 专家端
    ├── index/      # 主功能
    └── profile/    # 个人资料
```

### 服务层 (services)
```
services/
├── api.js          # API调用封装
├── storage.js      # 存储服务
├── user/           # 用户服务
│   ├── index.js    # 用户服务入口
│   └── auth.js     # 认证服务
└── specialist/     # 专家服务
    ├── index.js    # 专家服务入口
    └── client.js   # 客户管理服务
```

### 工具函数 (utils)
```
utils/
├── status.js       # 状态处理
├── time.js         # 时间处理
└── error.js        # 错误处理
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
  url: '/pages/user/profile/index'
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
cloud.init();

exports.main = async (event, context) => {
  const { action, params } = event;
  
  switch (action) {
    case 'list':
      return handleList(params);
    case 'detail':
      return handleDetail(params);
    default:
      return { error: 'Unknown action' };
  }
};

async function handleList(params) {
  // 处理列表请求
}

async function handleDetail(params) {
  // 处理详情请求
}
```

2. 云函数部署
- 在微信开发者工具中，右键点击云函数目录
- 选择"上传并部署：云端安装依赖"

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
```

### 更新 TESTING.md

```markdown:/Users/Sifan/Project/WeChatProjects/minatrack/docs/miniapp/TESTING.md
# 米娜体脂管理小程序测试文档

## 测试规范

### 1. 命名规范
```javascript
// 文件命名
utils/request.js -> __tests__/utils/request.test.js

// 测试用例命名
describe('功能模块名', () => {
  test('应该实现某个具体功能', () => {});
});
```

### 2. Mock 使用规范
```javascript
// 微信 API Mock
const wx = {
  request: jest.fn(),
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn()
};

// 重置 Mock
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. 测试覆盖率要求
- 核心业务逻辑: > 80%
- 工具函数: > 90%
- UI组件: > 70%

## 测试类型

### 1. 单元测试
测试独立的函数和组件：
```javascript
test('formatTime 应该正确格式化时间', () => {
  const time = new Date('2024-01-01T12:00:00');
  expect(formatTime(time)).toBe('今天');
});
```

### 2. 集成测试
测试多个组件或服务的交互：
```javascript
test('用户登录流程应该正常工作', async () => {
  // 模拟API响应
  api.callFunction.mockResolvedValue({ success: true });
  
  // 执行登录
  await userService.login();
  
  // 验证结果
  expect(api.callFunction).toHaveBeenCalledWith('user', {
    action: 'login'
  });
});
```

### 3. 端到端测试
使用自动化工具模拟用户操作：
```javascript
test('用户应该能够完成测量流程', async () => {
  // 模拟页面加载
  await page.goto('/pages/user/index/measure');
  
  // 模拟用户输入
  await page.fill('#weight', '65.5');
  await page.click('.submit-btn');
  
  // 验证结果页面
  expect(await page.isVisible('.success-message')).toBe(true);
});
```

## 测试执行

### 运行测试
```bash
# 运行所有测试
npm test

# 运行指定测试
npm test client.test.js

# 生成覆盖率报告
npm test -- --coverage
```

### 持续集成
每次提交代码时自动运行测试：
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

## 测试维护

### 1. 定期更新
- 随代码变更更新测试
- 定期检查测试有效性
- 优化测试性能

### 2. 问题排查
- 查看测试日志
- 检查 Mock 数据
- 验证测试环境

## 测试最佳实践

1. 保持测试简单明了
2. 一个测试只测试一个功能点
3. 使用有意义的测试数据
4. 避免测试间的依赖
5. 定期运行所有测试
```
