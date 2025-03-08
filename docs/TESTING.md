# 米娜体脂管理小程序测试文档

## 测试环境配置

### 依赖安装

```bash
# 安装测试依赖
npm install --save-dev jest @types/jest miniprogram-simulate
```

### Jest 配置

```javascript:/Users/Sifan/Project/WeChatProjects/minatrack/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'miniprogram/**/*.js',
    '!miniprogram/node_modules/**',
    '!miniprogram/miniprogram_npm/**'
  ],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['./jest.setup.js']
};
```

## 测试类型

### 1. 单元测试

测试独立的函数和组件：

```javascript
// __tests__/utils/format.test.js
const { formatTime, formatWeight } = require('../../miniprogram/utils/format');

describe('格式化工具测试', () => {
  test('formatTime 应该正确格式化时间', () => {
    const time = new Date('2024-01-01T12:00:00');
    expect(formatTime(time, 'YYYY-MM-DD')).toBe('2024-01-01');
  });

  test('formatWeight 应该正确格式化重量', () => {
    expect(formatWeight(65.5)).toBe('65.5');
    expect(formatWeight(65)).toBe('65.0');
  });
});
```

### 2. 服务测试

测试服务层逻辑：

```javascript
// __tests__/services/storage.test.js
const StorageService = require('../../miniprogram/services/storage');

// Mock wx API
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn()
};

describe('存储服务测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('set 方法应该正确调用 wx.setStorageSync', () => {
    StorageService.set('testKey', 'testValue');
    expect(wx.setStorageSync).toHaveBeenCalledWith('testKey', 'testValue');
  });

  test('get 方法应该正确调用 wx.getStorageSync', () => {
    wx.getStorageSync.mockReturnValue('testValue');
    const result = StorageService.get('testKey');
    expect(wx.getStorageSync).toHaveBeenCalledWith('testKey');
    expect(result).toBe('testValue');
  });
});
```

### 3. 云函数测试

测试云函数逻辑：

```javascript
// __tests__/cloudfunctions/user.test.js
const userFunction = require('../../cloudfunctions/user/index');

// Mock cloud API
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn()
};

global.cloud = {
  database: jest.fn().mockReturnValue(mockDb),
  getWXContext: jest.fn().mockReturnValue({ OPENID: 'test_openid' })
};

describe('用户云函数测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login 操作应该返回用户信息', async () => {
    mockDb.get.mockResolvedValue({
      data: [{ _id: 'user_id', _openid: 'test_openid' }]
    });

    const result = await userFunction.main({
      action: 'login'
    });

    expect(mockDb.collection).toHaveBeenCalledWith('users');
    expect(mockDb.where).toHaveBeenCalledWith({ _openid: 'test_openid' });
    expect(result.success).toBe(true);
    expect(result.data._id).toBe('user_id');
  });
});
```

## 测试规范

### 1. 命名规范

```javascript
// 文件命名
// utils/format.js -> __tests__/utils/format.test.js

// 测试用例命名
describe('模块名称', () => {
  test('应该实现某个具体功能', () => {
    // 测试代码
  });
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

// 模拟返回值
wx.request.mockImplementation((options) => {
  options.success({
    statusCode: 200,
    data: { success: true }
  });
});
```

### 3. 测试覆盖率要求

- 核心业务逻辑: > 80%
- 工具函数: > 90%
- UI组件: > 70%

## 测试执行

### 运行测试

```bash
# 运行所有测试
npm test

# 运行指定测试
npm test -- storage.test.js

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

### 3. 最佳实践

- 保持测试独立性
- 合理使用 setup 和 teardown
- 避免测试间互相依赖
- 使用有意义的测试数据
- 一个测试只测试一个功能点
```
