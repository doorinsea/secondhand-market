@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 Node.js，请先安装：https://nodejs.org
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [提示] 检测到还没有构建产物，正在安装依赖并构建，第一次会慢一点...
  call npm install --cache .npm-cache
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
  call npm run build
  if errorlevel 1 (
    echo [错误] 构建失败。
    pause
    exit /b 1
  )
)

echo.
echo 正在启动本地预览，浏览器会自动打开 http://127.0.0.1:4173
echo 需要停止时，在这个窗口按 Ctrl+C。
echo.
node serve.mjs --open
pause
