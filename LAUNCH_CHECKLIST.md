# 🚀 Clean Cloak - Quick Launch Checklist

**Target:** Get app live in 4-6 hours  
**Date:** December 7, 2025  
**Status:** Pre-Launch

---

## ⚡ CRITICAL PATH (Must Complete)

### Step 1: Deploy Frontend to Netlify (30 minutes)

#### Prerequisites:
- [ ] Netlify account created (free tier is fine)
- [ ] Netlify CLI installed: `npm install -g netlify-cli`

#### Commands:
```bash
# 1. Login to Netlify
netlify login

# 2. Navigate to project
cd C:\Users\king\Desktop\cloak\clean-cloak

# 3. Initialize Netlify site
netlify init

# Select options:
# - Create & configure a new site
# - Team: Your team
# - Site name: clean-cloak (or choose your own)
# - Build command: npm run build
# - Directory to deploy: dist

# 4. Deploy to production
netlify deploy --prod --dir=dist

# 5. Note the live URL (should be similar to):
# https://rad-maamoul-c7a511.netlify.app
```

#### Verification:
- [ ] Site loads without errors
- [ ] No 404 errors in browser console
- [ ] Home page displays correctly
- [ ] Login page accessible
- [ ] Booking page accessible

---

### Step 2: Configure Netlify Environment Variable (5 minutes)

#### In Netlify Dashboard:
1. [ ] Go to https://app.netlify.com
2. [ ] Click on your site (clean-cloak)
3. [ ] Go to **Site settings** → **Environment variables**
4. [ ] Click **Add a variable**
5. [ ] Add:
   ```
   Key: VITE_API_URL
   Value: https://clean-cloak-b.onrender.com/api
   ```
6. [ ] Save
7. [ ] Trigger new deploy: **Deploys** → **Trigger deploy** → **Deploy site**
8. [ ] Wait 2-3 minutes for redeploy

#### Verification:
- [ ] Open browser console on your site
- [ ] Check for API configuration log (if in dev mode)
- [ ] Try to login - should connect to backend

---

### Step 3: Verify Backend CORS (5 minutes)

#### Check backend allows Netlify:
```bash
# Test CORS from command line
curl -H "Origin: https://rad-maamoul-c7a511.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://clean-cloak-b.onrender.com/api/health \
     -v
```

#### Expected Response:
```
< access-control-allow-origin: https://rad-maamoul-c7a511.netlify.app
< access-control-allow-credentials: true
```

#### If CORS fails:
- [ ] Backend is already configured for `https://rad-maamoul-c7a511.netlify.app`
- [ ] If using different URL, update backend CORS in `backend/server.js`
- [ ] Redeploy backend to Render

---

### Step 4: Verify Payment System (60-90 minutes)

#### A. Check IntaSend Account:
- [ ] Log into https://intasend.com/dashboard
- [ ] Verify account status: **Business Verified** ✅
- [ ] Check KYC status: **Completed** ✅
- [ ] Verify bank account linked
- [ ] Verify M-Pesa configuration active

#### B. Check API Keys Mode:
- [ ] Go to **Settings** → **API Keys**
- [ ] Confirm mode is **LIVE** (not Test)
- [ ] Copy **Secret Key**
- [ ] Copy **Public Key**

#### C. Verify Backend Environment Variables:
```bash
# On Render dashboard (https://dashboard.render.com):
# 1. Go to your service (clean-cloak-b)
# 2. Go to Environment tab
# 3. Verify these exist:

INTASEND_SECRET_KEY=ISSecKey_live_xxxxx...
INTASEND_PUBLIC_KEY=ISPubKey_live_xxxxx...
INTASEND_WEBHOOK_SECRET=your_webhook_secret
```

#### D. Configure Webhook in IntaSend:
- [ ] Go to **Settings** → **Webhooks**
- [ ] Click **Add Webhook**
- [ ] Set URL: `https://clean-cloak-b.onrender.com/api/payments/webhook`
- [ ] Select events:
  - [x] payment.completed
  - [x] payment.failed
  - [x] collection.complete
- [ ] Copy webhook secret
- [ ] Save webhook

#### E. Test Payment Flow (CRITICAL):
```
⚠️ WARNING: This will charge your M-Pesa account KSh 50-100

Test Steps:
1. [ ] Open your deployed site
2. [ ] Sign up as new client
3. [ ] Create a booking (choose cheapest option)
4. [ ] Proceed to payment
5. [ ] Enter M-Pesa number
6. [ ] Click "Pay Now"
7. [ ] Check your phone for STK push
8. [ ] Enter M-Pesa PIN and confirm
9. [ ] Wait 10-30 seconds
10. [ ] Verify booking status changes to "Paid"
11. [ ] Check IntaSend dashboard for transaction
12. [ ] Check MongoDB for transaction record

If payment fails:
- Check browser console for errors
- Check backend logs on Render
- Verify webhook URL is correct
- Verify API keys are correct
- Contact IntaSend support if needed
```

#### Verification:
- [ ] STK push received on phone
- [ ] Payment processed successfully
- [ ] Webhook callback received (check Render logs)
- [ ] Booking status updated to "paid"
- [ ] Transaction recorded in database
- [ ] IntaSend dashboard shows transaction

---

### Step 5: Create Test Accounts (15 minutes)

#### A. Admin Account:
```bash
# Option 1: Use MongoDB Compass or Atlas
# Connect to your MongoDB and manually create admin user:
{
  "name": "Admin User",
  "email": "admin@cleancloak.com",
  "password": "<hashed_password>",  // Use bcrypt with 12 rounds
  "role": "admin",
  "phone": "+254700000000",
  "isVerified": true
}

# Option 2: Signup through app and manually change role in database
```

#### B. Cleaner Account:
- [ ] Go to your site
- [ ] Click "Sign Up"
- [ ] Select "Cleaner" role
- [ ] Fill in details
- [ ] Upload verification documents (use test images)
- [ ] Submit application

#### C. Client Account:
- [ ] Go to your site (use incognito mode)
- [ ] Click "Sign Up"
- [ ] Select "Client" role
- [ ] Fill in details
- [ ] Complete signup

#### Verification:
- [ ] All accounts created successfully
- [ ] Can login with each account
- [ ] Each role sees appropriate dashboard

---

### Step 6: End-to-End Testing (2-3 hours)

#### Test 1: Client Booking Flow (30 min)
- [ ] Login as client
- [ ] Go to booking page
- [ ] Select "Car Detailing"
- [ ] Choose service type (e.g., Full Detail)
- [ ] Select add-ons
- [ ] Enter vehicle details
- [ ] Choose location (allow GPS)
- [ ] Select date and time
- [ ] Review booking details
- [ ] Proceed to payment
- [ ] Complete payment (test with real money - small amount)
- [ ] Verify booking confirmation
- [ ] Check booking appears in "Active Bookings"

**Expected Result:** ✅ Booking created and payment processed

#### Test 2: Admin Approval Flow (20 min)
- [ ] Login as admin
- [ ] Go to admin dashboard
- [ ] Navigate to "Pending Cleaners"
- [ ] Find test cleaner account
- [ ] Review cleaner profile
- [ ] View uploaded documents
- [ ] Approve cleaner
- [ ] Add approval notes
- [ ] Verify cleaner status changes to "Approved"

**Expected Result:** ✅ Cleaner approved successfully

#### Test 3: Cleaner Acceptance Flow (20 min)
- [ ] Login as cleaner
- [ ] Check dashboard for available jobs
- [ ] Accept a booking
- [ ] Update status to "On the way"
- [ ] Update location (test GPS tracking)
- [ ] Update status to "In progress"
- [ ] Update status to "Completed"
- [ ] Verify payment received (check payout status)

**Expected Result:** ✅ Booking completed and payment split recorded

#### Test 4: Live Tracking (15 min)
- [ ] Login as client (with active booking)
- [ ] Go to "Active Bookings"
- [ ] Click on booking
- [ ] Verify tracking map loads
- [ ] Verify cleaner location shows
- [ ] Verify ETA displays
- [ ] Verify status updates show

**Expected Result:** ✅ Real-time tracking works

#### Test 5: Chat System (15 min)
- [ ] Login as client (with active booking)
- [ ] Open chat with cleaner
- [ ] Send test message
- [ ] Login as cleaner
- [ ] Open chat with client
- [ ] Reply to message
- [ ] Verify messages show on both sides

**Expected Result:** ✅ Chat messaging works

#### Test 6: Admin Dashboard (20 min)
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Check total cleaners count
- [ ] Check total bookings count
- [ ] Check revenue stats
- [ ] Navigate to "All Clients"
- [ ] View client details
- [ ] Navigate to "All Bookings"
- [ ] Filter bookings by status
- [ ] View booking details

**Expected Result:** ✅ Admin dashboard shows correct data

#### Test 7: Mobile Responsiveness (20 min)
- [ ] Open site on mobile device (or use browser dev tools)
- [ ] Test all pages on mobile view
- [ ] Verify layout adapts correctly
- [ ] Test booking flow on mobile
- [ ] Test navigation on mobile
- [ ] Test forms on mobile
- [ ] Verify buttons are touch-friendly

**Expected Result:** ✅ Mobile experience is good

#### Test 8: Browser Compatibility (15 min)
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on Edge
- [ ] Verify no console errors
- [ ] Verify all features work

**Expected Result:** ✅ Works on all major browsers

---

### Step 7: Bug Fixes (1-2 hours)

#### Document bugs found:
```
Bug #1:
- Description: 
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Priority: Critical/High/Medium/Low
- Status: Open/Fixed

Bug #2:
...
```

#### Fix critical bugs:
- [ ] Fix all P0 (blocker) bugs
- [ ] Fix all P1 (critical) bugs
- [ ] Test fixes
- [ ] Redeploy if needed

---

### Step 8: Set Up Monitoring (Optional but Recommended) (30 min)

#### A. Sentry Error Tracking:
```bash
# 1. Sign up at https://sentry.io (free tier)
# 2. Create new project: clean-cloak
# 3. Copy DSN

# 4. Add to backend:
npm install @sentry/node --save
# Add to backend/server.js (see Sentry docs)

# 5. Add to frontend:
npm install @sentry/react --save
# Add to src/main.tsx (see Sentry docs)

# 6. Redeploy both frontend and backend
```

#### B. Uptime Monitoring:
- [ ] Sign up at https://uptimerobot.com (free)
- [ ] Add monitor for: https://clean-cloak-b.onrender.com/api/health
- [ ] Set check interval: 5 minutes
- [ ] Add email alert

---

### Step 9: Configure Database Backups (15 min)

#### MongoDB Atlas Backups:
1. [ ] Log into https://cloud.mongodb.com
2. [ ] Select your cluster
3. [ ] Go to **Backup** tab
4. [ ] Enable **Continuous Backup** or **Cloud Backup**
5. [ ] Set backup schedule: Daily at 2 AM
6. [ ] Set retention: 7 days (or more)
7. [ ] Save configuration
8. [ ] Test restore procedure (optional)

---

## ✅ LAUNCH READY CHECKLIST

### Before Inviting Users:
- [ ] Frontend deployed to Netlify
- [ ] Environment variables configured
- [ ] Backend CORS configured correctly
- [ ] SSL certificate active (HTTPS)
- [ ] Payment system tested with real transaction
- [ ] IntaSend webhook configured and working
- [ ] Admin account created
- [ ] Test accounts created (client + cleaner)
- [ ] End-to-end booking flow tested
- [ ] Admin approval flow tested
- [ ] Tracking and chat tested
- [ ] Mobile responsiveness verified
- [ ] Critical bugs fixed
- [ ] Error tracking setup (recommended)
- [ ] Database backups configured (recommended)

---

## 🎯 GO/NO-GO DECISION

### ✅ GO (Safe to launch) if:
- ✅ Frontend is live and accessible
- ✅ Payment system tested successfully
- ✅ Full booking flow works end-to-end
- ✅ No critical bugs
- ✅ Admin can approve cleaners
- ✅ Tracking and chat work

### ❌ NO-GO (Do not launch) if:
- ❌ Frontend not deployed
- ❌ Payment system not tested
- ❌ Critical bugs present
- ❌ Booking flow broken
- ❌ CORS errors preventing API calls

---

## 🚀 BETA LAUNCH STRATEGY

### Phase 1: Internal Testing (Day 1-2)
- Invite 5-10 friends/family
- Monitor closely
- Fix bugs quickly
- Gather feedback

### Phase 2: Controlled Beta (Day 3-7)
- Invite 20-50 users
- Continue monitoring
- Iterate based on feedback
- Prepare for public launch

### Phase 3: Public Launch (Week 2+)
- Open to general public
- Marketing campaign
- Support team ready
- Scale infrastructure as needed

---

## 📞 EMERGENCY CONTACTS

### If Something Goes Wrong:

#### Site Down:
- Check Netlify status: https://www.netlifystatus.com
- Check Render status: https://status.render.com
- Check backend health: https://clean-cloak-b.onrender.com/api/health

#### Payment Issues:
- IntaSend support: support@intasend.com
- IntaSend dashboard: https://intasend.com/dashboard

#### Database Issues:
- MongoDB Atlas support: https://support.mongodb.com
- Check Atlas status: https://status.mongodb.com

#### Quick Rollback:
```bash
# If you need to quickly rollback frontend:
netlify deploy --prod --dir=dist

# Use previous deploy from Netlify dashboard
```

---

## 📝 NOTES & OBSERVATIONS

**Deployment Date:** _______________

**Issues Encountered:**
- 
- 
- 

**Solutions Applied:**
- 
- 
- 

**Users Invited:**
- 
- 
- 

**Feedback Received:**
- 
- 
- 

---

## 🎉 POST-LAUNCH

### After 24 Hours:
- [ ] Review error logs
- [ ] Check user analytics
- [ ] Address any issues
- [ ] Send thank you to beta users

### After 1 Week:
- [ ] Analyze user behavior
- [ ] Identify pain points
- [ ] Plan improvements
- [ ] Prepare for scaling

### After 1 Month:
- [ ] Review all metrics
- [ ] Plan feature additions
- [ ] Consider mobile APK build
- [ ] Plan marketing strategy

---

**Good luck with your launch! 🚀**

**Remember:** Start small, test thoroughly, scale gradually.