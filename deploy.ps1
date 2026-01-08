# CleanCloak - Deploy to Production
# Run this script in PowerShell to deploy your changes

Write-Host "🚀 CleanCloak Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git detected" -ForegroundColor Green
Write-Host ""

# Show current git status
Write-Host "📋 Current Changes:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to commit and push these changes? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

# Stage all changes
Write-Host "📦 Staging changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Fix cleaners job page: Add cookie-parser, fix API URLs, add credentials"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Render will now automatically deploy your backend..." -ForegroundColor Cyan
    Write-Host "   Check status at: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Wait 2-3 minutes for Render to deploy" -ForegroundColor White
    Write-Host "   2. Open test-cleaners-job-page.html to test" -ForegroundColor White
    Write-Host "   3. Build frontend: npm run build" -ForegroundColor White
    Write-Host "   4. Deploy to Netlify/Vercel" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try these solutions:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you're logged into GitHub" -ForegroundColor White
    Write-Host "   2. Check your internet connection" -ForegroundColor White
    Write-Host "   3. Verify remote URL: git remote -v" -ForegroundColor White
    exit 1
}

# Offer to open test page
Write-Host "🧪 Would you like to open the test page? (y/n)" -ForegroundColor Yellow
$openTest = Read-Host
if ($openTest -eq "y") {
    Start-Process "test-cleaners-job-page.html"
    Write-Host "✅ Test page opened in browser" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deployment initiated successfully!" -ForegroundColor Green
Write-Host ""
