$backendPath = "C:\homework\backend"
$frontendPath = "C:\homework\frontend"

Write-Host "启动后端服务器..." -ForegroundColor Green
$env:JWT_SECRET="test-secret-key"
$env:CORS_ORIGIN="http://localhost:8080"
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory $backendPath

Start-Sleep -Seconds 2

Write-Host "启动前端服务器..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "serve-frontend.js" -WorkingDirectory "C:\homework"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "===== 系统启动完成 =====" -ForegroundColor Cyan
Write-Host "前端页面: http://localhost:8080" -ForegroundColor Yellow
Write-Host "后端API: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "请打开浏览器访问前端页面进行注册和登录" -ForegroundColor Green
