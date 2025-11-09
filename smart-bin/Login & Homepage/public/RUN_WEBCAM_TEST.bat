@echo off
echo ========================================
echo Smart Bin - Webcam Detection Test
echo ========================================
echo.
echo This will open your webcam and detect items automatically.
echo Make sure:
echo   1. Flask server is running (webcam_server.py)
echo   2. Dashboard is open at http://localhost:8000/monitoring.html
echo.
echo Press any key to start...
pause >nul
echo.
cd /d "%~dp0"
python test_webcam_simple.py
pause

