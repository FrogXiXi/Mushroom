$pythonPath = $null

try {
  $pythonPath = (Get-Command py -ErrorAction Stop).Source
} catch {
}

if (-not $pythonPath) {
  try {
    $pythonPath = (Get-Command python -ErrorAction Stop).Source
  } catch {
  }
}

if (-not $pythonPath) {
  Write-Host "未找到 Python。请先安装 Python，或在有 Node.js 的环境中运行 npm install 和 npm run dev。" -ForegroundColor Red
  exit 1
}

Write-Host "本地预览地址：http://127.0.0.1:4173" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 可以停止服务。" -ForegroundColor DarkGray

& $pythonPath -m http.server 4173