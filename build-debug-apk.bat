@echo off
REM ================================================================
REM CleanCloak - Debug APK Build Script (Windows)
REM ================================================================
REM This script builds a debug APK for development/testing
REM ================================================================

setlocal enabledelayedexpansion

REM Colors (using Windows color codes)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

echo.
echo %BLUE%========================================%NC%
echo %BLUE%CleanCloak - Debug Build Script%NC%
echo %BLUE%========================================%NC%
echo.

REM ================================================================
REM STEP 1: Clean Previous Builds
REM ================================================================
echo %BLUE%========================================%NC%
echo %BLUE%Step 1/5: Cleaning Previous Builds%NC%
echo %BLUE%========================================%NC%
echo.

echo %YELLOW%→ Removing dist folder...%NC%
if exist "dist" rmdir /s /q "dist"

echo %YELLOW%→ Removing Vite cache...%NC%
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo %YELLOW%→ Cleaning Android build...%NC%
if exist "android" (
    cd android
    call gradlew.bat clean >nul 2>&1
    cd ..
)

echo %GREEN%✓ Cleanup complete%NC%
echo.

REM ================================================================
REM STEP 2: Install Dependencies
REM ================================================================
echo %BLUE%========================================%NC%
echo %BLUE%Step 2/5: Checking Dependencies%NC%
echo %BLUE%========================================%NC%
echo.

if not exist "node_modules" (
    echo %YELLOW%→ Installing npm dependencies...%NC%
    call npm install
    echo %GREEN%✓ Dependencies installed%NC%
) else (
    echo %GREEN%✓ Dependencies already installed%NC%
)
echo.

REM ================================================================
REM STEP 3: Build Development Frontend
REM ================================================================
echo %BLUE%========================================%NC%
echo %BLUE%Step 3/5: Building Development Frontend%NC%
echo %BLUE%========================================%NC%
echo.

echo %YELLOW%→ Running development build...%NC%
call npm run build

if exist "dist" (
    echo %GREEN%✓ Frontend built successfully%NC%
) else (
    echo %RED%✗ Build failed - dist folder not created%NC%
    exit /b 1
)
echo.

REM ================================================================
REM STEP 4: Sync with Capacitor
REM ================================================================
echo %BLUE%========================================%NC%
echo %BLUE%Step 4/5: Syncing with Capacitor%NC%
echo %BLUE%========================================%NC%
echo.

echo %YELLOW%→ Copying web assets to Android...%NC%
call npx cap sync android

echo %GREEN%✓ Capacitor sync complete%NC%
echo.

REM ================================================================
REM STEP 5: Build Debug APK
REM ================================================================
echo %BLUE%========================================%NC%
echo %BLUE%Step 5/5: Building Debug APK%NC%
echo %BLUE%========================================%NC%
echo.

echo %YELLOW%→ Starting Gradle debug build...%NC%
echo %YELLOW%→ This may take 2-5 minutes...%NC%
echo.

cd android
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo %RED%✗ Build failed! Check the output above for errors.%NC%
    cd ..
    pause
    exit /b 1
)

cd ..

REM ================================================================
REM Final Report
REM ================================================================
echo.
echo %BLUE%========================================%NC%
echo %BLUE%Build Complete!%NC%
echo %BLUE%========================================%NC%
echo.

set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"

if exist "%APK_PATH%" (
    for %%A in ("%APK_PATH%") do set "APK_SIZE=%%~zA"
    set /a APK_SIZE_MB=!APK_SIZE! / 1048576

    echo %GREEN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
    echo %GREEN%✓ DEBUG BUILD SUCCESSFUL%NC%
    echo %GREEN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
    echo.
    echo %BLUE%📦 APK Location:%NC%
    echo    %APK_PATH%
    echo.
    echo %BLUE%📊 APK Size:%NC% !APK_SIZE_MB! MB
    echo.
    echo %YELLOW%📱 Installation:%NC%
    echo    adb install -r "%APK_PATH%"
    echo.
    echo %YELLOW%⚡ For immediate testing:%NC%
    echo    npm run android:run
    echo.
    echo %GREEN%✓ Ready for development and testing! 🎉%NC%
    echo.

) else (
    echo %RED%✗ APK not found! Build may have failed.%NC%
    echo.
    echo %RED%Check the Gradle output above for errors%NC%
    pause
    exit /b 1
)

pause
exit /b 0