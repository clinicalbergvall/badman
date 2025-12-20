# ✅ Clean Cloak - Quick Testing Checklist

**Date:** December 7, 2025  
**Purpose:** Quick reference for testing after deployment  
**Time Required:** 2-3 hours

---

## 🎯 OVERVIEW

This is your quick-reference checklist for testing Clean Cloak after deployment. Follow these steps in order.

**Prerequisites:**
- ✅ Build completed successfully (`npm run build`)
- ✅ Frontend deployed to Netlify
- ✅ Backend live at https://clean-cloak-b.onrender.com
- ✅ IntaSend payment system configured

---

## 📱 STEP 1: CREATE TEST ACCOUNTS (15 minutes)

### A. Admin Account

**Option 1: Direct Database Creation**
```javascript
// In MongoDB Compass or Atlas
// Collection: users
{
  "name": "Admin User",
  "email": "admin@cleancloak.test",
  "password": "$2b$12$...",  // Use bcrypt to hash "Admin123!"
  "role": "admin",
  "phone": "+254700000000",
  "isVerified": true,
  "createdAt": new Date()
}
```

**Option 2: Sign up then modify role**
1. Sign up normally on website
2. Go to MongoDB and change `role` to `"admin"`

### B. Cleaner Account

**Website:** https://[your-netlify-url].netlify.app

1. Click "Sign Up"
2. Select "I'm a Cleaner"
3. Fill in:
   - Name: Test Cleaner
   - Email: cleaner@test.com
   - Phone: +254712345678
   - Password: Test123!
4. Submit

**Upload Documents:**
- ID: Any test image
- Police Clearance: Any test PDF/image
- References: Test document
- Insurance: Test document

### C. Client Account

**Use Incognito/Private browsing**

1. Click "Sign Up"
2. Select "I'm a Client"
3. Fill in:
   - Name: Test Client
   - Email: client@test.com
   - Phone: +254787654321
   - Password: Test123!
4. Submit

**Verification Checklist:**
- [ ] Admin account can login
- [ ] Cleaner account can login
- [ ] Client account can login
- [ ] Each sees appropriate dashboard

---

## 🧪 STEP 2: ADMIN APPROVAL FLOW (15 minutes)

**Login as Admin:**
- URL: https://[your-netlify-url].netlify.app
- Email: admin@cleancloak.test
- Password: Admin123!

**Test Steps:**

1. **Navigate to Admin Dashboard**
   - [ ] Dashboard loads without errors
   - [ ] Stats display correctly

2. **View Pending Cleaners**
   - [ ] Click "Pending Cleaners" or similar
   - [ ] Test cleaner appears in list
   - [ ] Can view cleaner profile

3. **Review Cleaner Profile**
   - [ ] All details visible
   - [ ] Documents visible/downloadable
   - [ ] Verification status shows "Pending"

4. **Approve Cleaner**
   - [ ] Click "Approve" button
   - [ ] Add approval notes (optional)
   - [ ] Submit approval
   - [ ] Success message appears
   - [ ] Cleaner status updates to "Approved"

5. **Verify in Database**
   - [ ] Check MongoDB `cleanerprofiles` collection
   - [ ] `approvalStatus: "approved"`
   - [ ] `approvedAt: [timestamp]`

---

## 🚗 STEP 3: CLIENT BOOKING FLOW (30 minutes)

**Login as Client:**
- Email: client@test.com
- Password: Test123!

### A. Create Booking

1. **Navigate to Booking Page**
   - [ ] Click "Book a Service" or "New Booking"
   - [ ] Page loads correctly

2. **Select Service Type**
   - [ ] Choose "Car Detailing"
   - [ ] Service options display

3. **Choose Service Package**
   - [ ] Select "Basic Wash" (cheapest option ~KSh 500-800)
   - [ ] Add-ons display (optional)
   - [ ] Can select/deselect add-ons

4. **Enter Vehicle Details**
   - Make: Toyota
   - Model: Corolla
   - Registration: KAA 123A
   - [ ] Validation works

5. **Choose Location**
   - [ ] GPS location works OR manual entry works
   - [ ] Can type address
   - [ ] Location saves

6. **Select Date & Time**
   - [ ] Date picker works
   - [ ] Time picker works
   - [ ] Choose: Tomorrow, 10:00 AM

7. **Review Booking**
   - [ ] All details correct
   - [ ] Price displayed correctly
   - [ ] Can edit if needed

8. **Proceed to Payment**
   - [ ] Click "Proceed to Payment" or "Book Now"
   - [ ] Redirects to payment page

### B. Complete Payment (REAL MONEY TEST - KSh 100)

⚠️ **WARNING: This will charge your M-Pesa account**

1. **Enter Payment Details**
   - [ ] Enter M-Pesa phone: 254XXXXXXXXX
   - [ ] Amount displayed correctly
   - [ ] Click "Pay Now"

2. **M-Pesa STK Push**
   - [ ] Receive STK push within 60 seconds
   - [ ] Amount matches booking price
   - [ ] Enter M-Pesa PIN
   - [ ] Confirm payment

3. **Wait for Confirmation**
   - [ ] Loading indicator shows
   - [ ] Success message appears (10-30 seconds)
   - [ ] Redirects to booking confirmation

4. **Verify Booking Confirmed**
   - [ ] Booking status: "Paid" or "Confirmed"
   - [ ] Booking appears in "My Bookings"
   - [ ] Can view booking details

### C. Backend Verification

**Check Render Logs:**
```
Expected logs:
[INFO] Webhook received from IntaSend
[INFO] Payment verified: transaction_xxxxx
[INFO] Booking updated: status=paid
[INFO] Transaction recorded
```

**Check MongoDB:**

Collection: `bookings`
```javascript
{
  status: "paid",
  paymentStatus: "completed",
  transactionId: "MPESA_XXXXX",
  paidAt: [timestamp]
}
```

Collection: `transactions`
```javascript
{
  bookingId: [booking_id],
  amount: 500,
  status: "completed",
  paymentMethod: "mpesa"
}
```

**Check IntaSend Dashboard:**
- [ ] Transaction appears
- [ ] Status: Completed
- [ ] Amount correct

---

## 🧹 STEP 4: CLEANER WORKFLOW (20 minutes)

**Login as Cleaner:**
- Email: cleaner@test.com
- Password: Test123!

### A. View Available Jobs

1. **Navigate to Dashboard**
   - [ ] Dashboard loads
   - [ ] Shows "Available Jobs" or similar

2. **Find Test Booking**
   - [ ] Your test booking appears
   - [ ] Details visible (location, time, price)

3. **Accept Booking**
   - [ ] Click "Accept" or "Accept Job"
   - [ ] Confirmation prompt appears
   - [ ] Confirm acceptance
   - [ ] Success message shows
   - [ ] Booking moves to "My Jobs"

### B. Update Job Status

1. **Start Job**
   - [ ] Navigate to active job
   - [ ] Click "Start" or "On My Way"
   - [ ] Status updates

2. **Update Location (if tracking enabled)**
   - [ ] Allow location access
   - [ ] Location updates on map

3. **Mark In Progress**
   - [ ] Click "In Progress"
   - [ ] Status updates
   - [ ] Client can see status

4. **Complete Job**
   - [ ] Click "Complete" or "Mark as Done"
   - [ ] Confirm completion
   - [ ] Status: "Completed"

### C. Verify Payment Split

**Check Database: `transactions`**
```javascript
{
  totalAmount: 500,
  cleanerPayout: 300,      // 60%
  platformFee: 200,        // 40%
  payoutStatus: "pending" or "completed"
}
```

---

## 💬 STEP 5: CHAT SYSTEM (10 minutes)

### As Client:

1. **Open Active Booking**
   - [ ] Navigate to "My Bookings"
   - [ ] Click on active booking
   - [ ] Find "Chat" or "Message" button

2. **Send Message**
   - [ ] Type message: "Hi, I'll be ready at 10 AM"
   - [ ] Click Send
   - [ ] Message appears in chat
   - [ ] Timestamp shows

### As Cleaner:

1. **Open Booking Chat**
   - [ ] Navigate to assigned job
   - [ ] Open chat
   - [ ] See client's message

2. **Reply**
   - [ ] Type: "Great! I'll be there on time"
   - [ ] Send message
   - [ ] Message appears

### Verify:

- [ ] Messages appear on both sides
- [ ] Timestamps correct
- [ ] Read receipts (if implemented)
- [ ] No errors in console

---

## 📍 STEP 6: LIVE TRACKING (10 minutes)

### As Client:

1. **Open Active Booking**
   - [ ] Click on active booking
   - [ ] Find "Track" or "Live Location" button

2. **View Map**
   - [ ] Map loads
   - [ ] Cleaner location marker shows (if cleaner has location enabled)
   - [ ] ETA displays (if available)
   - [ ] Updates in real-time (every 10-30 seconds)

### As Cleaner:

1. **Enable Location**
   - [ ] Allow browser/app location access
   - [ ] Location permissions granted

2. **Update Location**
   - [ ] Move to different location (or simulate)
   - [ ] Verify location updates

### Verify:

- [ ] Map displays correctly
- [ ] Markers visible
- [ ] Updates work
- [ ] No console errors

---

## 🎛️ STEP 7: ADMIN DASHBOARD DATA (10 minutes)

**Login as Admin**

### A. Dashboard Statistics

- [ ] Total Bookings count correct
- [ ] Total Revenue calculated
- [ ] Active Cleaners count
- [ ] Pending Approvals count
- [ ] Charts/graphs display (if any)

### B. View All Clients

- [ ] Navigate to "Clients" or "All Users"
- [ ] Test client appears in list
- [ ] Can view client details
- [ ] Booking history shows

### C. View All Bookings

- [ ] Navigate to "Bookings" or "All Bookings"
- [ ] Test booking appears
- [ ] Can filter by status (Pending, Paid, Completed)
- [ ] Can view booking details

### D. View Transactions

- [ ] Navigate to "Transactions" or "Payments"
- [ ] Test transaction appears
- [ ] Amount correct
- [ ] Status correct
- [ ] Can view transaction details

---

## 📱 STEP 8: MOBILE TESTING (20 minutes)

### Option A: Browser DevTools

1. **Open Chrome DevTools**
   - Press F12
   - Click device icon (Toggle device toolbar)
   - Select device: iPhone 12 Pro

2. **Test Key Flows**
   - [ ] Signup works
   - [ ] Login works
   - [ ] Booking flow works
   - [ ] Payment works
   - [ ] Navigation works
   - [ ] Buttons are touch-friendly
   - [ ] Text is readable
   - [ ] Forms are usable

### Option B: Real Mobile Device

1. **Open on Phone**
   - Open https://[your-netlify-url].netlify.app
   - Login as client

2. **Test Features**
   - [ ] Site loads quickly
   - [ ] Layout looks good
   - [ ] Can scroll smoothly
   - [ ] Buttons work on touch
   - [ ] Forms are easy to fill
   - [ ] Payment works
   - [ ] Location works

---

## 🌐 STEP 9: BROWSER COMPATIBILITY (15 minutes)

### Test on Multiple Browsers:

**Chrome:**
- [ ] Site loads
- [ ] All features work
- [ ] No console errors

**Firefox:**
- [ ] Site loads
- [ ] All features work
- [ ] No console errors

**Safari (if available):**
- [ ] Site loads
- [ ] All features work
- [ ] No console errors

**Edge:**
- [ ] Site loads
- [ ] All features work
- [ ] No console errors

---

## 🐛 STEP 10: ERROR SCENARIOS (15 minutes)

### A. Invalid Login

- [ ] Try wrong password
- [ ] Error message displays
- [ ] User-friendly message
- [ ] No console errors

### B. Network Issues

- [ ] Open DevTools → Network tab
- [ ] Throttle to "Slow 3G"
- [ ] Try booking flow
- [ ] Loading states show
- [ ] Eventually works or shows timeout message

### C. Form Validation

- [ ] Try submitting empty forms
- [ ] Validation messages show
- [ ] Can't proceed with invalid data

### D. Payment Failure

- [ ] Initiate payment
- [ ] Cancel STK push
- [ ] Error message shows
- [ ] Can retry payment
- [ ] Booking not lost

---

## 📋 BUGS LOG TEMPLATE

Document any bugs you find:

### Bug #1
- **Page/Feature:** 
- **Description:** 
- **Steps to Reproduce:**
  1. 
  2. 
  3. 
- **Expected Result:** 
- **Actual Result:** 
- **Priority:** Critical / High / Medium / Low
- **Status:** Open / Fixed / Won't Fix

### Bug #2
...

---

## ✅ FINAL GO/NO-GO CHECKLIST

Mark each as complete:

### Critical (Must Pass):
- [ ] Frontend deployed and accessible
- [ ] Backend API responding
- [ ] Can create accounts
- [ ] Can login
- [ ] Can create booking
- [ ] Payment processes successfully
- [ ] Booking status updates after payment
- [ ] Admin can approve cleaners
- [ ] No critical errors in console

### Important (Should Pass):
- [ ] Chat works
- [ ] Tracking works (basic)
- [ ] Mobile responsive
- [ ] Works on Chrome
- [ ] Works on at least 1 other browser

### Nice to Have:
- [ ] Works perfectly on all browsers
- [ ] No minor bugs
- [ ] Perfect mobile experience
- [ ] Fast loading times

---

## 🚦 DECISION

### ✅ GO - Safe to Launch Beta if:
- All Critical items checked ✅
- 80%+ Important items checked ✅
- No blocker bugs

### ⚠️ CAUTION - Limited Launch if:
- All Critical items checked ✅
- 60%+ Important items checked ✅
- Minor bugs present but not blocking
→ Launch to 5-10 friends only

### ❌ NO-GO - Do Not Launch if:
- Any Critical item fails ❌
- Payment system doesn't work ❌
- Critical bugs present ❌
→ Fix issues first

---

## 📊 TEST RESULTS

**Test Date:** _______________  
**Tested By:** _______________

### Summary:
- Total Tests: _____ / _____
- Passed: _____ 
- Failed: _____
- Critical Bugs: _____
- Minor Bugs: _____

### Decision:
- [ ] ✅ GO - Ready for Beta Launch
- [ ] ⚠️ CAUTION - Limited Launch Only
- [ ] ❌ NO-GO - More Work Needed

### Notes:
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎯 QUICK START COMMANDS

### Deploy Frontend:
```bash
cd C:\Users\king\Desktop\cloak\clean-cloak
npm run build
netlify deploy --prod --dir=dist
```

### Check Backend:
```bash
curl https://clean-cloak-b.onrender.com/api/health
```

### View Logs:
- Render: https://dashboard.render.com → clean-cloak-b → Logs
- Netlify: https://app.netlify.com → Your Site → Functions/Logs

---

## 📞 EMERGENCY CONTACTS

### If Critical Issues:
1. Check backend health: https://clean-cloak-b.onrender.com/api/health
2. Check Render status: https://status.render.com
3. Check Netlify status: https://www.netlifystatus.com
4. Check MongoDB Atlas: https://status.mongodb.com

### Quick Rollback:
```bash
# Rollback frontend to previous deploy
netlify rollback
```

---

**Good luck with testing! 🚀**

**Remember:** 
- Take your time
- Document everything
- Test thoroughly
- Fix critical bugs before launch
- Start small (beta users first)