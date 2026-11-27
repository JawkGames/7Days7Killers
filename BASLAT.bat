@echo off
cd /d "%~dp0"
echo 7 Days 7 Killers aciliyor: http://localhost:8087/index.html
start /b powershell -NoProfile -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://localhost:8087/index.html'"
python -m http.server 8087 --directory www
