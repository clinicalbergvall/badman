# 🚀 Deployment Setup Guide - Clean Cloak

**Frontend URL:** https://rad-maamoul-c7a511.netlify.app/  
**Backend URL:** https://clean-cloak-b.onrender.com  
**APK Build:** Mobile application  

---

## 📊 Quick Answer to Your Question

**Q: Will the Netlify deployment affect the APK compilation?**

**A: NO! They are completely separate.** ✅

### Why?

1. **Netlify Deployment (Web)**
   - Runs in web browsers
   - Accesses backend via internet
   - Users visit: https://rad-maamoul-c7a511.netlify.app/

2. **APK Compilation (Mobile)**
   - Bundles frontend code INTO the APK
   - APK contains all HTML/CSS/JS files
   - Runs locally on Android device
   - Still accesses same backend API

**Both use the same backend:** https://clean-cloak-b.onrender.com/api

---

## 🔧 Configuration Needed

You need to update **2 places**:

### 1️⃣ **Backend CORS Configuration** (CRITICAL)

Your backend needs to allow the new Netlify URL.

**File:** `backend/server.js` (or backend `.env`)

**Current CORS (from your server.js):**
```javascript
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);
```

**What to do:**

#### Option A: Update Backend .env (RECOMMENDED)
```bash
# backend/.env

# Add your new Netlify URL
FRONTEND_URL=https://rad-maamoul-c7a511.netlify.app
ALLOWED_ORIGINS=https://rad-maamoul-c7a511.netlify.app,https://sprightly-trifle-9b980c.netlify.app,https://teal-daffodil-d3a9b2.netlify.app,http://localhost:5173,http://localhost:3000

# Other config...
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

#### Option B: Update server.js directly
```javascript
// backend/server.js (line ~56)

app.use(cors({
  origin: [
    'https://rad-maamoul-c7a511.netlify.app',        // ✅ NEW - Your production frontend
    'https://sprightly-trifle-9b980c.netlify.app',   // Old frontend
    'https://teal-daffodil-d3a9b2.netlify.app',      // Old frontend
    'http://localhost:5173',                          // Local development
    'http://localhost:3000',                          // Alternative local
    'capacitor://localhost',                          // ✅ For APK
    'ionic://localhost',                              // ✅ For APK
    'http://localhost'                                // ✅ For APK
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Then deploy backend:**
```bash
cd backend
git add server.js  # or .env if you updated that
git commit -m "Add new Netlify URL to CORS"
git push origin main
```

---

### 2️⃣ **Frontend Environment Variable**

**File:** `clean-cloak/.env`

```bash
# Frontend .env

# API URL (same for both Netlify and APK)
VITE_API_URL=https://clean-cloak-b.onrender.com/api
```

**This is correct! Don't change it.** ✅

The `.env` file gets bundled into:
- ✅ The Netlify deployment
- ✅ The APK build

Both will use the same backend URL.

---

## 🌐 Netlify Deployment Steps

### **Step 1: Build Production Frontend**

```bash
cd clean-cloak

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# This creates: dist/ folder
```

### **Step 2: Deploy to Netlify**

#### Option A: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Your site will be at: https://rad-maamoul-c7a511.netlify.app/
```

#### Option B: Netlify Dashboard
1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your `dist/` folder
4. Site deployed! ✅

#### Option C: Connect to Git (BEST)
1. Push your code to GitHub
2. Go to Netlify Dashboard
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
6. Environment variables:
   ```
   VITE_API_URL=https://clean-cloak-b.onrender.com/api
   ```
7. Click "Deploy site"
8. Auto-deploys on every push! 🎉

---

## 📱 APK Build Steps

**The APK is NOT affected by Netlify deployment!**

### **Step 1: Ensure .env is Correct**

```bash
# clean-cloak/.env
VITE_API_URL=https://clean-cloak-b.onrender.com/api
```

### **Step 2: Build Optimized APK**

```bash
cd clean-cloak

# Use the automated script
build-optimized-apk.bat  # Windows
# OR
./build-optimized-apk.sh  # Mac/Linux

# Or manually:
npm run clean
npm run build:prod
npx cap sync android
cd android
gradlew.bat assembleRelease  # Windows
# OR
./gradlew assembleRelease  # Mac/Linux
```

### **Step 3: Find Your APK**

```
Location: clean-cloak/android/app/build/outputs/apk/release/app-release-unsigned.apk

Size: ~15-20 MB (optimized)
Type: Release build (fast and optimized)
```

### **Step 4: Install on Device**

```bash
# Connect phone via USB with USB debugging enabled
adb install -r android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔍 How It Works

### **Netlify Deployment (Web App)**

```
User Browser
    ↓
https://rad-maamoul-c7a511.netlify.app/
    ↓
Loads HTML/CSS/JS from Netlify
    ↓
JavaScript makes API calls to:
https://clean-cloak-b.onrender.com/api
    ↓
Backend responds with data
    ↓
Browser displays result
```

### **APK Installation (Mobile App)**

```
User Phone
    ↓
APK installed on device
    ↓
APK contains HTML/CSS/JS files LOCALLY
    ↓
Opens in Capacitor WebView
    ↓
JavaScript makes API calls to:
https://clean-cloak-b.onrender.com/api
    ↓
Backend responds with data
    ↓
App displays result
```

**Key Difference:**
- **Netlify:** Downloads files from Netlify server each time
- **APK:** Files already bundled in app, no download needed

**Similarity:**
- **Both:** Use same backend API
- **Both:** Use same .env configuration
- **Both:** Same functionality

---

## ✅ Verification Checklist

### **After Backend CORS Update:**

- [ ] Updated CORS to include `https://rad-maamoul-c7a511.netlify.app`
- [ ] Added APK origins (`capacitor://localhost`, etc.)
- [ ] Deployed backend to Render
- [ ] Tested backend health: `curl https://clean-cloak-b.onrender.com/api/health`

### **For Netlify Deployment:**

- [ ] `.env` has correct `VITE_API_URL`
- [ ] Run `npm run build`
- [ ] Deploy to Netlify
- [ ] Visit https://rad-maamoul-c7a511.netlify.app/
- [ ] Test login
- [ ] Test booking creation
- [ ] Check browser console for CORS errors (should be none)

### **For APK Build:**

- [ ] `.env` has correct `VITE_API_URL`
- [ ] Run `npm run build:prod`
- [ ] Run `npx cap sync android`
- [ ] Build release APK
- [ ] APK size < 25 MB
- [ ] Install on real device
- [ ] Test all features
- [ ] No lag (60 FPS)

---

## 🚨 Common Issues & Solutions

### **Issue #1: CORS Error on Netlify**

**Error in browser console:**
```
Access to fetch at 'https://clean-cloak-b.onrender.com/api/...' 
from origin 'https://rad-maamoul-c7a511.netlify.app' 
has been blocked by CORS policy
```

**Solution:**
1. Add Netlify URL to backend CORS (see above)
2. Deploy backend
3. Wait 1-2 minutes for deployment
4. Refresh Netlify site

---

### **Issue #2: APK Can't Connect to API**

**Error:** Network request failed

**Solution:**
1. Check `.env` has correct `VITE_API_URL`
2. Rebuild APK: `npm run build:prod && npx cap sync android`
3. Add APK origins to backend CORS:
   ```javascript
   'capacitor://localhost',
   'ionic://localhost',
   'http://localhost'
   ```
4. Make sure phone has internet connection
5. Check backend is accessible: `curl https://clean-cloak-b.onrender.com/api/health`

---

### **Issue #3: Environment Variable Not Working**

**Problem:** App still uses old API URL

**Solution:**
1. Delete `dist/` folder
2. Delete `android/app/build/` folder
3. Clean build:
   ```bash
   npm run clean
   npm run build:prod
   npx cap sync android
   ```
4. Rebuild APK

---

### **Issue #4: Netlify Build Fails**

**Error:** "Build failed"

**Solution:**
1. Check build command is correct: `npm run build`
2. Check publish directory is correct: `dist`
3. Add environment variable on Netlify:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://clean-cloak-b.onrender.com/api`
4. Trigger manual deploy

---

## 📊 Configuration Summary

### **Backend (Render)**
```javascript
// server.js - CORS origins
[
  'https://rad-maamoul-c7a511.netlify.app',  // NEW Netlify
  'capacitor://localhost',                    // APK
  'ionic://localhost',                        // APK
  'http://localhost',                         // APK
  'http://localhost:5173'                     // Local dev
]
```

### **Frontend (Netlify & APK)**
```bash
# .env
VITE_API_URL=https://clean-cloak-b.onrender.com/api
```

### **Build Commands**
```bash
# For Netlify
npm run build

# For APK
npm run build:prod
npx cap sync android
cd android && gradlew.bat assembleRelease
```

---

## 🎯 Final Answer

**Q: Will deploying to Netlify affect APK compilation?**

**A: NO!** ✅

### Why Not?

1. **Separate Build Processes**
   - Netlify: `npm run build` → uploads to Netlify servers
   - APK: `npm run build:prod` → bundles into APK file

2. **Same Backend**
   - Both use: `https://clean-cloak-b.onrender.com/api`
   - Both read from `.env` file
   - Both make API calls over internet

3. **Different Delivery**
   - Netlify: Serves files via HTTPS
   - APK: Files stored on phone

4. **Independent Deployment**
   - Deploy to Netlify: doesn't affect APK
   - Build new APK: doesn't affect Netlify
   - Can do both separately

### What You Need to Do

1. ✅ **Update backend CORS** (add Netlify URL)
2. ✅ **Deploy to Netlify** (separate from APK)
3. ✅ **Build APK** (separate from Netlify)
4. ✅ **Both work independently!**

---

## 🚀 Quick Setup Commands

### **Backend Update:**
```bash
cd backend
# Edit server.js or .env to add new Netlify URL
git add .
git commit -m "Add Netlify URL to CORS"
git push origin main
```

### **Netlify Deployment:**
```bash
cd clean-cloak
npm run build
netlify deploy --prod --dir=dist
```

### **APK Build:**
```bash
cd clean-cloak
build-optimized-apk.bat  # Or ./build-optimized-apk.sh
```

---

## ✅ Expected Results

### **After Setup:**

**Netlify (Web):**
- ✅ Users can visit: https://rad-maamoul-c7a511.netlify.app/
- ✅ Can signup, login, book services
- ✅ API calls work (no CORS errors)
- ✅ Real-time features work

**APK (Mobile):**
- ✅ Install APK on Android phone
- ✅ Can signup, login, book services
- ✅ API calls work
- ✅ Real-time features work
- ✅ No lag (60 FPS)

**Both:**
- ✅ Use same backend
- ✅ Same user accounts
- ✅ Same data
- ✅ Same functionality

---

## 📞 Support

**If you have issues:**

1. Check backend CORS includes Netlify URL
2. Check `.env` has correct API URL
3. Clear browser cache
4. Rebuild APK from scratch
5. Check Render backend logs
6. Test API directly: `curl https://clean-cloak-b.onrender.com/api/health`

---

**Last Updated:** December 7, 2024  
**Status:** ✅ Ready for deployment  
**Netlify:** https://rad-maamoul-c7a511.netlify.app/  
**Backend:** https://clean-cloak-b.onrender.com  
**APK:** Independent build, not affected by Netlify