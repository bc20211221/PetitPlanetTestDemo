@echo off
chcp 65001 >nul
title 方块星球 · 本地服务器

echo ========================================
echo   方块星球 · 关卡编辑器本地服务器
echo ========================================
echo.

REM 检查 PowerShell
where powershell >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 PowerShell，本脚本仅支持 Windows 7+。
  pause
  exit /b 1
)

cd /d "%~dp0"

REM 检查端口 8765 是否被占用
netstat -ano | findstr ":8765" >nul 2>&1
if not errorlevel 1 (
  echo [警告] 端口 8765 已被占用，尝试 8766...
  set PORT=8766
) else (
  set PORT=8765
)

echo 正在启动本地服务器（端口 %PORT%）...
echo 工作目录：%cd%
echo.

REM 用 PowerShell HttpListener 启动（零依赖，Win7+ 自带）
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Write-Host '服务已启动: http://localhost:%PORT%/editor.html' -ForegroundColor Green; Write-Host '按 Ctrl+C 关闭服务器'; try { $l = New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:%PORT%/'); $l.Start(); while($l.IsListening){ $ctx = $l.GetContext(); $req = $ctx.Request; $res = $ctx.Response; $path = $req.Url.LocalPath; if($path -eq '/'){$path='/index.html'}; $full = Join-Path (Get-Location) ($path.TrimStart('/')); if(Test-Path $full){$bytes=[System.IO.File]::ReadAllBytes($full); $ext=[System.IO.Path]::GetExtension($full).ToLower(); $mime=switch($ext){'.html'{'text/html; charset=utf-8'};'.js'{'application/javascript; charset=utf-8'};'.css'{'text/css; charset=utf-8'};'.png'{'image/png'};'.jpg'{'image/jpeg'};'.svg'{'image/svg+xml'}; default{'application/octet-stream'}}; $res.ContentType=$mime; $res.OutputStream.Write($bytes,0,$bytes.Length)} else {$res.StatusCode=404; $msg=[System.Text.Encoding]::UTF8.GetBytes('404 Not Found'); $res.OutputStream.Write($msg,0,$msg.Length)}; $res.Close() } } catch { Write-Host ('错误: ' + $_.Exception.Message) -ForegroundColor Red; pause }"

REM 等待 2 秒后打开浏览器
timeout /t 2 /nobreak >nul

echo 打开浏览器...
start "" "http://localhost:%PORT%/editor.html"

echo.
echo 服务器在后台运行。关闭时：右键任务栏 PowerShell 图标 → 关闭窗口
echo 或直接关闭本窗口（如果 PowerShell 窗口未独立弹出）
echo.
pause
