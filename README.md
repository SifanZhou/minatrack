# 米娜体脂管理小程序

## 项目简介

米娜体脂管理小程序是一款专注于体脂管理的微信小程序，为用户提供体脂数据记录、分析和管理功能，同时支持专业健康管理师对用户进行远程指导。项目采用TypeScript进行开发，确保代码质量和可维护性。

## 功能特点

### 用户端
- 微信一键登录与授权
- 个人资料管理
- 体脂数据记录与历史查看
- 智能体脂秤连接与数据同步
- 健康数据可视化分析
- 绑定专业管理师
- 离线数据存储与自动同步

### 管理师端
- 客户列表管理
- 客户详情查看
- 客户数据分析
- 健康建议推送
- 周报生成
- 服务码管理

## 技术架构

### 前端技术栈
- 框架：微信小程序（WXML + WXSS + TypeScript）
- 状态管理：本地缓存 + 云数据同步
- UI组件：自定义组件库
- 数据可视化：原生Canvas绘制

### 后端技术栈
- 云开发：微信云开发平台
- 数据库：云数据库
- 存储：云存储
- 计算：云函数

### 数据同步
- 支持离线记录
- 网络恢复后自动同步
- 数据冲突处理

## 开发环境

- 微信开发者工具：最新版
- Node.js：v12.0.0 及以上
- TypeScript：v4.9.5
- 云开发环境：minatrack-0gee1z7vf57df583

## 项目结构

```
minatrack/
├── cloudfunctions/        # 云函数目录
│   ├── user/              # 用户相关云函数
│   ├── specialist/        # 管理师相关云函数
│   ├── device/            # 设备相关云函数
│   └── system/            # 系统相关云函数
├── miniprogram/           # 小程序前端代码
│   ├── config/            # 配置文件
│   ├── pages/             # 页面目录
│   │   ├── user/          # 用户端页面
│   │   └── specialist/    # 管理师端页面
│   ├── services/          # 服务层
│   │   ├── api.js         # API接口
│   │   ├── user.js        # 用户服务
│   │   ├── measure.js     # 测量服务
│   │   └── specialist.js  # 管理师服务
│   ├── utils/            # 工具函数
│   └── mock/             # 模拟数据
├── common/               # 公共代码
│   ├── config/           # 配置
│   ├── types/            # 类型定义
│   └── utils/            # 工具函数
└── .project/docs/           # 项目文档
    ├── api/              # API文档
    ├── components/       # 组件文档
    └── guide/            # 开发指南
```

## 开发指南

1. 克隆项目
```bash
git clone https://github.com/sifanzhou/minatrack.git
```

2. 安装依赖
```bash
npm install
```

3. 在微信开发者工具中导入项目

4. 开通云开发环境
- 创建云开发环境
- 复制环境ID到config/index.ts

5. 部署云函数
```bash
# 安装云函数依赖
cd cloudfunctions/user && npm install
cd ../specialist && npm install
cd ../device && npm install

# 上传并部署云函数
```

6. 运行项目
- 在微信开发者工具中编译项目
- 使用真机调试功能测试

## 调试指南

### 本地调试
- 使用TypeScript编译监听
- 配置VS Code调试
- 使用Mock数据进行开发（config/index.ts中设置useLocalMock为true）

### 云函数调试
- 使用云开发控制台
- 本地云函数调试
- 云函数日志查看

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)