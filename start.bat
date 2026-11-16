@echo off
echo =============================================
echo    Cement Plant Digital Twin - Docker Start   
echo =============================================

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not in PATH.
    echo Please install Docker Desktop for Windows.
    pause
    exit /b 1
)

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
)

echo Building and starting containers...
docker compose up --build -d

echo.
echo =============================================
echo   All services started successfully!
echo =============================================
echo   * Main Dashboard:   http://localhost:5174
echo   * Gypsum Widget:    http://localhost:5174/gypsum
echo   * Materials Widget: http://localhost:5174/materials
echo   * Backend API:      http://localhost:4000/api/items
echo   * MQTT Broker:      localhost:1883
echo =============================================
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo =============================================
pause

