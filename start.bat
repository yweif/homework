@echo off
cd /d C:\homework

start "Backend" cmd /k "cd backend && set JWT_SECRET=test-secret-key && set CORS_ORIGIN=http://localhost:8080 && node src/index.js"

timeout /t 2 >nul

start "Frontend" cmd /k "cd frontend && npx vite --host 0.0.0.0 --port 8080"

echo.
echo ===== 系统启动中 =====
echo 前端: http://localhost:8080
echo 后端: http://localhost:3000
echo.
