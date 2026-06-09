Write-Host "===== 回家作业系统一键部署脚本 =====" -ForegroundColor Green
Write-Host ""

# 检查 Docker 是否安装
try {
    docker --version | Out-Null
} catch {
    Write-Host "错误: Docker 未安装，请先安装 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 创建 .env 文件
if (-not (Test-Path "backend\.env")) {
    Write-Host "创建后端环境配置文件..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
}

# 构建前端
Write-Host "构建前端项目..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# 启动 Docker 容器
Write-Host "启动 Docker 容器..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d --build

Write-Host ""
Write-Host "===== 部署完成 =====" -ForegroundColor Green
Write-Host "前端访问地址: http://localhost:8080"
Write-Host "后端API地址: http://localhost:3000"
Write-Host "MySQL数据库: localhost:3306"
Write-Host ""
Write-Host "默认数据库信息:"
Write-Host "  数据库名: homework_db"
Write-Host "  用户名: root"
Write-Host "  密码: password"
Write-Host ""
Write-Host "使用 'docker-compose logs -f' 查看日志"
