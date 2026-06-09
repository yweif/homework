# 回家作业系统

## 系统概述
本系统是一个支持Web端和iOS App端的回家作业管理平台，采用B/S架构，服务器端支持容器化部署。

## 系统构成
- **服务器端（backend）**：Node.js + Express + MySQL，提供RESTful API
- **Web端（frontend）**：Vue 3 + Element Plus，提供作业管理界面
- **iOS App端（app）**：SwiftUI，提供移动端作业查询和状态更新

## 功能特性

### 服务器端
- 用户认证（JWT Token）
- RESTful API接口
- 容器化部署支持

### Web端
- 作业看板，状态概览
- 按学科分类管理
- 作业的增删改查
- 状态跟踪

### iOS App端
- 按学科查询作业
- 开始/完成作业
- 自动记录时间

## 快速部署

### 前置要求
- Docker Desktop（Windows/Mac）或 Docker + Docker Compose（Linux）
- Node.js 18+（用于前端构建）
- Xcode 14+（用于iOS App编译）

### 一键部署（服务器端 + Web端）
Windows:
```powershell
.\deploy\deploy.ps1
```

Linux/Mac:
```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

部署完成后访问：
- 前端：http://localhost:8080
- 后端API：http://localhost:3000
- MySQL：localhost:3306

### iOS App安装
1. 使用Xcode打开 `app/HomeworkApp.xcodeproj`
2. 连接iPhone设备或使用模拟器
3. 点击运行按钮编译安装

注意：需要修改 `app/HomeworkApp/Services/APIService.swift` 中的 `baseURL`，将 `localhost` 改为服务器实际IP地址。

## 默认配置
- 数据库：homework_db
- 数据库用户：root
- 数据库密码：password
- JWT密钥：your-super-secret-jwt-key-change-this-in-production

## 目录结构
```
homework/
├── backend/          # 服务器端代码
├── frontend/        # Web前端代码
├── app/             # iOS App代码
├── deploy/          # 部署脚本和配置
├── docker-compose.yml  # Docker编排文件
└── README.md        # 本文件
```

## 技术栈
- **后端**：Node.js, Express, MySQL, JWT, bcrypt
- **前端**：Vue 3, Vite, Element Plus, Axios
- **移动端**：Swift, SwiftUI
- **部署**：Docker, Docker Compose, Nginx

## 开发说明

### 后端开发
```bash
cd backend
npm install
cp .env.example .env  # 修改配置
npm run dev
```

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### iOS开发
使用Xcode打开项目进行开发和调试。

## 许可证
MIT License
