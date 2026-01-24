@echo off
echo Building CleanCloak APK...
cd /d "c:\Users\king\Desktop\cloakclient$app\cloak detailer"
call npm run build
if %errorlevel% neq 0 (
    echo Build failed
    exit /b %errorlevel%
)
call npx cap sync android
if %errorlevel% neq 0 (
    echo Capacitor sync failed
    exit /b %errorlevel%
)
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo APK build failed
    exit /b %errorlevel%
)
echo APK built successfully!