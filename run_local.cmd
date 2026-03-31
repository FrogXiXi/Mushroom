@echo off
setlocal

where py >nul 2>nul
if %errorlevel%==0 (
  echo 本地预览地址：http://127.0.0.1:4173
  echo 按 Ctrl+C 可以停止服务。
  py -m http.server 4173
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo 本地预览地址：http://127.0.0.1:4173
  echo 按 Ctrl+C 可以停止服务。
  python -m http.server 4173
  goto :eof
)

echo 未找到 Python。请先安装 Python，或在有 Node.js 的环境中运行 npm install 和 npm run dev。
exit /b 1