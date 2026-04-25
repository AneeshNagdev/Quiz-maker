@echo off
title Interactive Quiz Launcher
color 0A

echo ===================================================
echo     Launching Interactive Quiz...
echo ===================================================
echo.
echo Starting the application in your default web browser...
start "" "%~dp0index.html"

echo.
echo If the browser didn't open automatically, please manually copy and paste this link into your browser:
echo file:///%~dp0index.html
echo.

echo You do not need VS Code or any other software running. 
echo You can safely close this window once the quiz loads.
echo.
pause
