# 米娜体脂管理小程序

## 项目简介

米娜体脂管理小程序是一款专注于体脂管理的微信小程序，为用户提供体脂数据记录、分析和管理功能，同时支持专业健康管理师对用户进行远程指导。

## 功能特点

### 用户端
- 微信一键登录
- 个人资料管理
- 体脂数据记录与历史查看
- 健康问卷填写
- 绑定专业管理师
- 智能设备连接与数据同步

### 管理师端
- 客户列表管理
- 客户详情查看
- 客户数据分析
- 健康建议推送
- 周报生成

## 技术架构

- 前端：微信小程序（WXML + WXSS + JavaScript）
- 后端：云开发（云函数 + 云数据库 + 云存储）
- 数据同步：支持离线记录，网络恢复后自动同步

## 开发环境

- 微信开发者工具：最新版
- Node.js：v12.0.0 及以上
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
│   ├── pages/             # 页面目录
│   │   ├── user/          # 用户端页面
│   │   └── specialist/    # 管理师端页面
│   ├── components/        # 自定义组件
│   ├── services/          # 服务层
│   └── utils/             # 工具函数
└── docs/                  # 项目文档
```

## 开发指南

1. 克隆项目
2. 在微信开发者工具中导入项目
3. 开通云开发环境
4. 部署云函数
5. 运行项目

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
```
