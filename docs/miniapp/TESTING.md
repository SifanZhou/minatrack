# MinaTrack 小程序测试文档

## 测试环境配置

### 依赖安装
```bash
# 安装测试相关依赖
npm install --save-dev jest @types/jest @jest/globals ts-jest
```

### Jest 配置
```typescript:/Users/Sifan/Project/minatrack-app/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 测试类型

### 1. 单元测试
主要测试工具函数和核心逻辑。

```typescript
// RequestQueue 测试示例
describe('RequestQueue', () => {
  test('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() => 
      requestQueue.add({
        url: '/test',
        method: 'GET'
      })
    );
    
    await Promise.all(requests);
    expect(wx.request).toHaveBeenCalledTimes(10);
  });
});
```

### 2. 集成测试
测试多个组件或功能的协同工作。

```typescript
describe('蓝牙设备集成测试', () => {
  test('应该完成完整的连接流程', async () => {
    const bluetooth = new BluetoothManager();
    await bluetooth.connect(deviceId);
    
    // 验证数据上传
    await requestQueue.add({
      url: '/api/data/upload',
      method: 'POST',
      data: deviceData
    });
  });
});
```

## 测试规范

### 1. 命名规范
```typescript
// 文件命名
utils/request.ts -> __tests__/utils/request.test.ts

// 测试用例命名
describe('功能模块名', () => {
  test('应该实现某个具体功能', () => {});
});
```

### 2. Mock 使用规范

```typescript
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

### 3. 异步测试规范

```typescript
test('异步操作测试', async () => {
  // 使用 async/await
  await expect(
    requestQueue.add({ url: '/test' })
  ).resolves.toBeDefined();

  // 验证 reject 情况
  await expect(
    requestQueue.add({ url: '/error' })
  ).rejects.toThrow();
});
```

## 测试覆盖率要求

1. 核心功能
- 请求队列：100%
- 错误处理：100%
- 蓝牙管理：90%

2. 工具函数
- 缓存管理：90%
- 状态管理：90%

3. 业务逻辑
- 用户认证：80%
- 数据处理：80%

## 测试执行

### 运行测试
```bash
# 运行所有测试
npm test

# 运行指定测试
npm test queue.test.ts

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