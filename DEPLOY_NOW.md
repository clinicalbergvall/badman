# 🚀 DEPLOY NOW - Final Steps to Launch

**Date:** December 7, 2025  
**Status:** READY TO DEPLOY  
**Time Required:** 30-45 minutes

---

## ✅ WHAT'S BEEN DONE

- ✅ Backend payment endpoints added
- ✅ Frontend payment modal created
- ✅ BookingEnhanced updated
- ✅ Frontend built successfully
- ✅ All code ready for deployment

---

## 📋 DEPLOYMENT STEPS

### STEP 1: Update Backend Environment Variables (5 minutes)

**Go to:** https://dashboard.render.com

1. Click on your service: **clean-cloak-b**
2. Click **Environment** in the left sidebar
3. **CRITICAL:** Update/Add these variables:

```
INTASEND_PUBLIC_KEY=ISPubKey_live_xxxxxxxxxxxxx
INTASEND_SECRET_KEY=ISSecKey_live_xxxxxxxxxxxxx
INTASEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
BACKEND_URL=https://clean-cloak-b.onrender.com
```

**⚠️ IMPORTANT:**
- Variable name is `INTASEND_PUBLIC_KEY` (NOT PUBLISHABLE_KEY)
- Keys must be LIVE mode (start with ISPubKey_live_ and ISSecKey_live_)
- Get these from IntaSend dashboard: https://intasend.com/dashboard

4. Click **Save Changes**
5. Backend will auto-redeploy (takes 2-3 minutes)
6. Wait for deployment to complete

---

### STEP 2: Configure IntaSend Webhook (5 minutes)

**Go to:** https://intasend.com/dashboard

1. Login to your account
2. Go to **Settings** → **Webhooks**
3. Click **Add Webhook** (or edit existing)
4. **Webhook URL:** 
   ```
   https://clean-cloak-b.onrender.com/api/payments/webhook
   ```
5. **Select Events:**
   - ✅ payment.completed
   - ✅ payment.failed
   - ✅ collection.complete
6. Copy the **Webhook Secret** shown
7. Add this secret to Render environment variables (see Step 1)
8. Click **Save Webhook**

---

### STEP 3: Deploy Frontend to Netlify (10 minutes)

**Open PowerShell/Terminal:**

```powershell
# Navigate to project
cd C:\Users\king\Desktop\cloak\clean-cloak

# Login to Netlify (if not already logged in)
netlify login

# Deploy to production
netlify deploy --prod --dir=dist
```

**Follow the prompts:**
- Choose: **Create & configure a new site** (or select existing)
- Team: Your Netlify team
- Site name: clean-cloak (or your choice)
- Publish directory: dist

**Note your Live URL** (example: https://rad-maamoul-c7a511.netlify.app)

---

### STEP 4: Set Netlify Environment Variable (5 minutes)

**Go to:** https://app.netlify.com

1. Click on your site (**clean-cloak**)
2. Go to **Site settings**
3. Click **Environment variables** in left sidebar
4. Click **Add a variable**
5. Add:
   ```
   Key: VITE_API_URL
   Value: https://clean-cloak-b.onrender.com/api
   ```
6. Click **Save**
7. Go to **Deploys** tab
8. Click **Trigger deploy** → **Deploy site**
9. Wait 2-3 minutes for redeploy

---

### STEP 5: Verify Deployment (5 minutes)

**Check Backend:**
```powershell
curl https://clean-cloak-b.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Clean Cloak API is running",
  "database": {
    "state": "connected",
    "healthy": true
  }
}
```

**Check Frontend:**
- Open: https://[your-netlify-url].netlify.app
- Should load without errors
- Login page should be visible
- Check browser console (F12) - no errors

---

## 🧪 TESTING WITH REAL MONEY

### Test Payment Flow (20 minutes)

⚠️ **WARNING:** This will charge your M-Pesa account KSh 50-100

**Steps:**

1. **Go to your site:** https://[your-netlify-url].netlify.app

2. **Create Account:**
   - Click "Sign Up"
   - Select "I'm a Client"
   - Fill in your details
   - Use YOUR REAL phone number
   - Create account

3. **Create Booking:**
   - Select "Car Detailing"
   - Choose "Sedan"
   - Choose "Basic Wash" (cheapest option)
   - Fill in all details
   - Click "Continue" through all steps
   - Click "Confirm Booking"

4. **Payment Modal Should Appear:**
   - ✅ Modal shows automatically
   - ✅ Shows "Initiating payment..."
   - ✅ Changes to "Check your phone for M-Pesa prompt..."

5. **Complete Payment on Phone:**
   - Check your phone (within 60 seconds)
   - M-Pesa STK push should appear
   - Enter your M-Pesa PIN
   - Confirm payment
   - You'll receive M-Pesa confirmation SMS

6. **Payment Modal Updates:**
   - Modal polls backend every 3 seconds
   - Should show "Payment successful! 🎉" (within 10-30 seconds)
   - Automatically redirects

7. **Verify Booking:**
   - Go to "My Bookings" or dashboard
   - Your booking should show status: "Paid" ✅
   - Transaction details visible

---

## ✅ SUCCESS CHECKLIST

Payment system is working when:

- [ ] STK push received on phone within 60 seconds
- [ ] Payment completed successfully
- [ ] Payment modal showed success message
- [ ] Booking status changed to "Paid"
- [ ] Transaction recorded in database
- [ ] No errors in Render logs
- [ ] No errors in browser console

---

## 🔍 CHECK BACKEND LOGS

**Go to:** https://dashboard.render.com

1. Click on **clean-cloak-b**
2. Click **Logs** tab
3. Look for:

```
💳 Initiating payment for booking...
✅ STK Push initiated successfully
[Webhook] Payment verified
[Webhook] Booking updated: status=paid
Payment SUCCESS: KSh XXX
Platform fee (40%): KSh XXX
Cleaner payout (60%): KSh XXX
```

---

## 🚨 TROUBLESHOOTING

### Problem: STK Push Not Received

**Check:**
1. Phone number format correct? (254XXXXXXXXX)
2. IntaSend M-Pesa configured?
3. API keys are LIVE mode?
4. Check Render logs for errors

**Fix:**
- Verify phone number has no spaces, +, or leading 0
- Go to IntaSend dashboard → Settings → M-Pesa
- Verify keys start with `ISPubKey_live_` and `ISSecKey_live_`

---

### Problem: Payment Modal Stuck on "Waiting"

**Check:**
1. Was webhook received? (Check Render logs)
2. Is booking status updated in MongoDB?
3. Any errors in browser console?

**Fix:**
- Verify webhook URL in IntaSend: `https://clean-cloak-b.onrender.com/api/payments/webhook`
- Check webhook secret matches Render env var
- Test webhook from IntaSend dashboard

---

### Problem: "Authentication Required" Error

**Fix:**
- Logout and login again
- Clear browser cache
- Check if token is stored (F12 → Application → Local Storage)

---

## 📊 VERIFY IN DATABASE

**Go to:** https://cloud.mongodb.com

1. Click your cluster
2. Click **Browse Collections**
3. Find **bookings** collection
4. Search for your test booking
5. **Verify:**
   ```javascript
   {
     paymentStatus: "paid",
     paid: true,
     paidAt: [timestamp],
     transactionId: "MPESA_XXXXXX"
   }
   ```
6. Find **transactions** collection
7. **Verify transaction exists:**
   ```javascript
   {
     type: "payment",
     status: "completed",
     amount: [amount],
     metadata: {
       split: {
         platformFee: [40%],
         cleanerPayout: [60%]
       }
     }
   }
   ```

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL TEST

### Immediate:
1. ✅ Test payment successful
2. ✅ Webhook working
3. ✅ Booking updated correctly
4. **Ready for beta users!**

### Launch to Beta Users:
1. Test with 2-3 more people
2. Verify different phone numbers work
3. Test on different devices (Android, iPhone, desktop)
4. Monitor Render logs for any issues
5. Fix any bugs quickly

### Week 1:
1. Add webhook signature verification (security)
2. Set up error tracking (Sentry)
3. Configure database backups
4. Create user documentation
5. Prepare support materials

---

## 📞 SUPPORT CONTACTS

### IntaSend Issues:
- Email: support@intasend.com
- Dashboard: https://intasend.com/dashboard

### Render Issues:
- Dashboard: https://dashboard.render.com
- Status: https://status.render.com

### Netlify Issues:
- Dashboard: https://app.netlify.com
- Status: https://www.netlifystatus.com

---

## 🎉 CONGRATULATIONS!

If your test payment succeeded:

✅ Your payment system is LIVE and WORKING!  
✅ You can now accept real customer payments!  
✅ Revenue generation is enabled!  
✅ Ready for beta launch!

---

## 📋 QUICK REFERENCE

### Your URLs:
- **Backend:** https://clean-cloak-b.onrender.com
- **Frontend:** https://[your-netlify-url].netlify.app
- **IntaSend:** https://intasend.com/dashboard
- **Render:** https://dashboard.render.com
- **Netlify:** https://app.netlify.com
- **MongoDB:** https://cloud.mongodb.com

### Key Environment Variables:
```
Backend (Render):
- INTASEND_PUBLIC_KEY
- INTASEND_SECRET_KEY
- INTASEND_WEBHOOK_SECRET
- BACKEND_URL

Frontend (Netlify):
- VITE_API_URL
```

### Test Payment Amount:
- Minimum: KSh 50
- Recommended: KSh 100-500
- Use: Your real M-Pesa number

---

## ⏱️ TOTAL TIME ESTIMATE

- Step 1 (Backend Env Vars): 5 min
- Step 2 (IntaSend Webhook): 5 min
- Step 3 (Deploy Frontend): 10 min
- Step 4 (Netlify Env Vars): 5 min
- Step 5 (Verify): 5 min
- **Test Payment:** 20 min

**Total:** 30-45 minutes

---

## 🚀 START NOW!

**Begin with Step 1** and work through sequentially.

Good luck! Your payment system is ready to go live! 💪🎉

---

**Last Updated:** December 7, 2025  
**Status:** READY FOR DEPLOYMENT  
**Next Action:** Update Render environment variables (Step 1)