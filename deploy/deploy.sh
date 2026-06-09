#!/bin/bash

echo "===== 回家作业系统一键部署脚本 ====="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建 .env 文件
if [ ! -f backend/.env ]; then
    echo "创建后端环境配置文件..."
    cp backend/.env.example backend/.env
fi

# 构建前端
echo "构建前端项目..."
cd frontend
npm install
npm run build
cd ..

# 启动 Docker 容器
echo "启动 Docker 容器..."
docker-compose down
docker-compose up -d --build

echo ""
echo "===== 部署完成 ====="
echo "前端访问地址: http://localhost:8080"
echo "后端API地址: http://localhost:3000"
echo "MySQL数据库: localhost:3306"
echo ""
echo "默认数据库信息:"
echo "  数据库名: homework_db"
echo "  用户名: root"
echo "  密码: password"
echo ""
echo "请使用 docker-compose logs -f 查看日志"
