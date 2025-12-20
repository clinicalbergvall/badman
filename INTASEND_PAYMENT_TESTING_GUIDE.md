# 🔐 IntaSend Payment System - Complete Testing Guide

**Purpose:** Verify IntaSend M-Pesa integration works correctly before accepting real customer payments  
**Time Required:** 1-2 hours  
**Risk Level:** HIGH - Must complete before launch  
**Date:** December 7, 2025

---

## ⚠️ CRITICAL WARNING

**DO NOT SKIP THIS GUIDE!**

Testing payments with real money is the ONLY way to verify your integration works. If you skip this:
- ❌ Customers may pay but bookings won't update
- ❌ Money could be lost or stuck
- ❌ Cleaners won't receive payouts
- ❌ Your reputation will be damaged
- ❌ Legal/financial issues possible

**Investment:** KSh 100-200 for testing (you can use this money for real bookings later)

---

## 📋 PRE-TESTING CHECKLIST

Before testing payments, verify these are complete:

### Account Setup:
- [ ] IntaSend account created at https://intasend.com
- [ ] Business verification (KYC) completed
- [ ] Bank account linked
- [ ] M-Pesa paybill/till number active
- [ ] Account approved for live transactions

### API Configuration:
- [ ] API keys generated in LIVE mode (not test mode)
- [ ] Secret key copied
- [ ] Public key copied
- [ ] Webhook secret generated

---

## 🔑 STEP 1: Verify IntaSend Account Status (10 minutes)

### A. Log Into IntaSend Dashboard

1. Go to https://intasend.com/dashboard
2. Login with your credentials
3. Check the top banner for account status

### B. Verify Account Verification Status

**Required Status:**
```
✅ Email Verified
✅ Phone Verified
✅ Business Verified (KYC Complete)
✅ Bank Account Linked
✅ M-Pesa Integration Active
```

**If ANY of these are incomplete:**
- ❌ STOP - Do not proceed with testing
- Complete verification first (may take 1-3 business days)
- Contact IntaSend support: support@intasend.com

### C. Check Available Payment Methods

Navigate to: **Settings** → **Payment Methods**

Verify enabled:
- [x] M-Pesa (C2B - Customer to Business)
- [x] Card Payments (optional)
- [x] Bank Transfer (optional)

**For Clean Cloak, M-Pesa is CRITICAL.**

---

## 🔐 STEP 2: Verify API Keys are in LIVE Mode (5 minutes)

### A. Navigate to API Keys

Dashboard → **Settings** → **API Keys**

### B. Check Current Mode

Look for mode indicator at the top:
```
Current Mode: [LIVE] ✅  or  [TEST] ❌
```

**If in TEST mode:**
- Toggle to LIVE mode using the switch
- Confirm the switch (may require password)
- Keys will change - copy new keys

### C. Copy Your LIVE Keys

You should see:
```
Publishable Key: ISPubKey_live_xxxxxxxxxxxxx...
Secret Key:      ISSecKey_live_xxxxxxxxxxxxx...
```

**IMPORTANT:** 
- Test keys start with `ISPubKey_test_` or `ISSecKey_test_`
- Live keys start with `ISPubKey_live_` or `ISSecKey_live_`
- NEVER use test keys in production
- NEVER share secret keys publicly

### D. Copy Keys to Safe Location

Save to a temporary secure note (delete after adding to backend):
```
INTASEND_PUBLIC_KEY=ISPubKey_live_xxxxxxxxxxxxx
INTASEND_SECRET_KEY=ISSecKey_live_xxxxxxxxxxxxx
```

---

## 🔔 STEP 3: Configure Webhook (15 minutes)

### A. Navigate to Webhooks

Dashboard → **Settings** → **Webhooks**

### B. Check Existing Webhooks

If you see an existing webhook for Clean Cloak:
- Click **Edit**
- Verify URL is correct
- If correct, skip to Step C

If no webhook exists:
- Click **Add New Webhook**

### C. Configure Webhook URL

**Webhook URL:**
```
https://clean-cloak-b.onrender.com/api/payments/webhook
```

**Events to Subscribe:**
Select these events:
- [x] `payment.completed` - Payment succeeded
- [x] `payment.failed` - Payment failed
- [x] `collection.complete` - M-Pesa collection completed
- [x] `payment.pending` - Payment pending (optional)

**Description:**
```
Clean Cloak Booking Payment Notifications
```

### D. Generate and Save Webhook Secret

IntaSend will generate a webhook secret. **Copy this immediately!**

```
Webhook Secret: whsec_xxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** You cannot retrieve this later. If lost, you must regenerate (which breaks existing webhooks).

### E. Save Webhook

- Click **Save** or **Create Webhook**
- Verify webhook appears in list with status: **Active** ✅

---

## 🖥️ STEP 4: Update Backend Environment Variables (10 minutes)

### A. Access Render Dashboard

1. Go to https://dashboard.render.com
2. Login to your account
3. Find service: **clean-cloak-b**
4. Click on the service

### B. Navigate to Environment Variables

Click on **Environment** tab in left sidebar

### C. Update/Add IntaSend Keys

Add or update these variables:

**INTASEND_PUBLIC_KEY**
```
ISPubKey_live_xxxxxxxxxxxxx
```

**INTASEND_SECRET_KEY**
```
ISSecKey_live_xxxxxxxxxxxxx
```

**INTASEND_WEBHOOK_SECRET**
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

**NODE_ENV** (verify it's set to)
```
production
```

### D. Save and Redeploy

- Click **Save Changes**
- Render will automatically redeploy (takes 2-3 minutes)
- Wait for deploy to complete

### E. Verify Backend Restarted

Check deployment logs:
- Look for "Server started on port 5000" or similar
- Verify no errors related to IntaSend

---

## 🧪 STEP 5: Test Payment Flow (30-45 minutes)

### Test 1: Small Amount Payment (KSh 50)

This is your first real transaction. Follow carefully.

#### A. Create Test Booking

1. **Open your deployed site:** https://rad-maamoul-c7a511.netlify.app (or your Netlify URL)
2. **Login or Sign Up** as a client
3. **Navigate to Booking Page**
4. **Select Service:** Car Detailing
5. **Choose Cheapest Option:** Basic Wash (should be around KSh 500-1000)
6. **Fill in Details:**
   - Vehicle: Test Car (Reg: KAA 123A)
   - Location: Your test location
   - Date/Time: Today + 2 hours
7. **Review Booking Details**
8. **Proceed to Payment**

#### B. Initiate Payment

1. **Enter Phone Number:** Your M-Pesa number (format: 254XXXXXXXXX)
2. **Verify Amount:** Should match booking price
3. **Click "Pay Now" or "Initiate Payment"**

#### C. Complete M-Pesa Payment

Within 30-60 seconds, you should receive:

**On Your Phone:**
```
M-Pesa Payment Request
From: IntaSend/Clean Cloak
Amount: KSh XXX
Enter PIN to confirm
```

**Actions:**
1. **Check amount is correct**
2. **Enter M-Pesa PIN**
3. **Confirm payment**

**Expected M-Pesa Confirmation:**
```
KSh XXX sent to Clean Cloak
Transaction Cost: KSh XX
New Balance: KSh XXXX
Transaction ID: XXXXXXXXXX
```

#### D. Monitor Backend for Webhook (Critical!)

**Render Logs (Real-time monitoring):**

1. Open Render dashboard: https://dashboard.render.com
2. Go to your service: clean-cloak-b
3. Click **Logs** tab
4. Watch for webhook callback (should appear 10-30 seconds after payment)

**Expected log entries:**
```
[INFO] Webhook received: payment.completed
[INFO] Payment verified: transaction_id_xxxxx
[INFO] Booking updated: booking_id_xxxxx status=paid
[INFO] Transaction recorded: transaction_id_xxxxx
```

**If you see errors:**
```
[ERROR] Webhook signature verification failed
[ERROR] Payment processing failed
```
→ See Troubleshooting section

#### E. Verify Booking Status Updated

**In your app:**
1. Go to "My Bookings" or "Active Bookings"
2. Find your test booking
3. **Status should now be:** `Paid` or `Confirmed` ✅

**If status is still "Pending":**
- ❌ Webhook not received or processing failed
- Check Render logs immediately
- See Troubleshooting section

#### F. Verify in IntaSend Dashboard

1. Go to IntaSend Dashboard → **Transactions**
2. Find your test transaction
3. **Verify details:**
   - Amount: Correct ✅
   - Status: Completed ✅
   - Customer: Your phone number ✅
   - Transaction ID: Recorded ✅

#### G. Verify in MongoDB Database

**Using MongoDB Atlas:**
1. Log into https://cloud.mongodb.com
2. Go to your cluster
3. Click **Browse Collections**
4. Find collection: `bookings`
5. Search for your test booking (by ID or phone number)
6. **Verify fields:**
   ```javascript
   {
     status: "paid",
     paymentStatus: "completed",
     paymentMethod: "mpesa",
     transactionId: "XXXXXXXXXX",
     paidAt: "2025-12-07T..."
   }
   ```
7. Find collection: `transactions`
8. **Verify transaction record exists:**
   ```javascript
   {
     bookingId: "...",
     amount: 500,
     status: "completed",
     paymentMethod: "mpesa",
     mpesaReceiptNumber: "...",
     createdAt: "..."
   }
   ```

---

### Test 2: Payment Failure Scenario (10 minutes)

Test what happens when payment fails.

#### A. Initiate Payment

1. Create another test booking (same process as Test 1)
2. Proceed to payment
3. Enter phone number

#### B. Cancel Payment

When STK push appears on phone:
- **DO NOT ENTER PIN**
- Wait for timeout (30-60 seconds) or
- Click "Cancel" if available

#### C. Verify Failure Handling

**Expected behavior:**
1. User sees error message: "Payment failed" or "Payment cancelled"
2. Booking status remains: `Pending` or changes to `Payment Failed`
3. User can retry payment

**Check Render logs:**
```
[INFO] Webhook received: payment.failed
[INFO] Booking updated: status=payment_failed
```

**User experience should be:**
- ✅ Clear error message
- ✅ Option to retry payment
- ✅ Booking not lost

---

### Test 3: Cleaner Payout (Revenue Split) (20 minutes)

Test the 60/40 revenue split to cleaners.

#### Prerequisites:
- Test 1 completed successfully (paid booking exists)
- Cleaner account exists and approved
- Booking assigned to cleaner

#### A. Complete the Booking

1. **Login as cleaner** (or admin to simulate)
2. **Mark booking as completed**
   - Update status: "In Progress" → "Completed"
3. **Verify completion triggers payout calculation**

#### B. Check Payout Calculation

**In MongoDB (transactions collection):**
```javascript
{
  bookingId: "...",
  totalAmount: 1000,        // Total booking price
  cleanerPayout: 600,       // 60% to cleaner
  platformFee: 400,         // 40% to platform
  payoutStatus: "pending",  // or "processing"
  payoutMethod: "mpesa"
}
```

#### C. Verify Cleaner Receives Payout

**This depends on your implementation:**

**Option A: Automatic Payout (if implemented)**
- Cleaner should receive M-Pesa within 1-2 hours
- Check cleaner's phone for M-Pesa receipt
- Verify amount is 60% of booking price

**Option B: Manual Payout (if automatic not implemented)**
- Admin sees pending payouts in dashboard
- Admin manually triggers payout
- Cleaner receives money

**Check IntaSend Dashboard:**
1. Go to **Payouts** or **Transfers**
2. Verify payout transaction exists
3. Check status and amount

#### D. Verify in Database

**transactions collection:**
```javascript
{
  payoutStatus: "completed",  // Updated from "pending"
  paidOutAt: "2025-12-07T...",
  payoutTransactionId: "XXXXXXXXX"
}
```

---

## ✅ SUCCESS CRITERIA

Your payment system is working correctly if ALL of these are true:

### Payment Processing:
- [x] STK push appears on phone within 60 seconds
- [x] Payment completes successfully
- [x] M-Pesa confirmation received
- [x] Transaction appears in IntaSend dashboard

### Webhook Integration:
- [x] Webhook callback received in Render logs
- [x] Webhook signature verified successfully
- [x] No webhook errors in logs

### Database Updates:
- [x] Booking status updates to "paid"
- [x] Transaction record created
- [x] Correct amount recorded
- [x] Transaction ID saved

### User Experience:
- [x] User sees payment success message
- [x] Booking appears in "Active Bookings"
- [x] User can track booking
- [x] Payment failure handled gracefully

### Revenue Split:
- [x] 60/40 split calculated correctly
- [x] Cleaner payout amount correct
- [x] Platform fee calculated correctly
- [x] Payout status tracked

---

## 🚨 TROUBLESHOOTING

### Problem: STK Push Not Received

**Symptoms:**
- Clicked "Pay Now" but no STK push on phone

**Possible Causes:**
1. Phone number format incorrect
2. IntaSend M-Pesa integration inactive
3. API keys invalid

**Solutions:**
```
1. Verify phone format: 254XXXXXXXXX (no +, no spaces)
2. Check IntaSend dashboard: M-Pesa enabled?
3. Verify API keys are LIVE mode
4. Check Render logs for IntaSend API errors
5. Test with different phone number
```

---

### Problem: Webhook Not Received

**Symptoms:**
- Payment completed on M-Pesa
- No logs in Render
- Booking status not updated

**Possible Causes:**
1. Webhook URL incorrect
2. Webhook not configured in IntaSend
3. Webhook secret mismatch
4. Backend not processing webhook

**Solutions:**
```
1. Verify webhook URL in IntaSend dashboard:
   https://clean-cloak-b.onrender.com/api/payments/webhook

2. Test webhook manually:
   - IntaSend dashboard → Webhooks → Test Webhook
   - Check Render logs for incoming request

3. Verify webhook secret matches in backend .env

4. Check backend code: routes/payments.js
   - Webhook endpoint exists?
   - Signature verification correct?

5. Check Render logs for errors:
   - "Webhook signature verification failed"
   - "Invalid signature"
```

---

### Problem: Payment Completed but Booking Not Updated

**Symptoms:**
- M-Pesa confirmation received
- Webhook received in logs
- Booking status still "pending"

**Possible Causes:**
1. Database update failed
2. Booking ID mismatch
3. Error in webhook handler

**Solutions:**
```
1. Check Render logs after webhook:
   [ERROR] Failed to update booking: ...

2. Verify booking ID in webhook payload matches database

3. Check MongoDB connection:
   - Database healthy?
   - Collections accessible?

4. Manually update booking in MongoDB (temporary):
   db.bookings.updateOne(
     { _id: ObjectId("...") },
     { $set: { status: "paid", paymentStatus: "completed" } }
   )

5. Fix code issue and retest
```

---

### Problem: Wrong Amount Charged

**Symptoms:**
- Expected KSh 500, charged KSh 5000

**Possible Causes:**
1. Amount calculation error in frontend
2. Currency handling issue (cents vs shillings)

**Solutions:**
```
1. Check booking price calculation
2. Verify amount sent to IntaSend API (check logs)
3. IntaSend amounts in CENTS (multiply by 100)
   Example: KSh 500 = 50000 cents
4. Fix calculation and retest
```

---

### Problem: Payout Not Sent to Cleaner

**Symptoms:**
- Booking completed
- No payout to cleaner

**Possible Causes:**
1. Automatic payout not implemented
2. Payout API not called
3. IntaSend payout not configured

**Solutions:**
```
1. Check if automatic payout is implemented
   - Search code for "payout" or "disbursement"

2. Verify IntaSend payout setup:
   - Dashboard → Payouts
   - Payout method configured?
   - Bank/M-Pesa linked?

3. Check transaction record in database:
   - payoutStatus: "pending"?
   - Should trigger payout

4. Manual payout (temporary):
   - IntaSend dashboard → Payouts → New Payout
   - Send 60% to cleaner manually
```

---

## 📊 TEST RESULTS TEMPLATE

Document your test results:

### Test Date: _______________

### Test 1: Basic Payment
- [ ] STK push received: ✅ / ❌
- [ ] Payment completed: ✅ / ❌
- [ ] Webhook received: ✅ / ❌
- [ ] Booking updated: ✅ / ❌
- [ ] Transaction recorded: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

### Test 2: Payment Failure
- [ ] Failure handled gracefully: ✅ / ❌
- [ ] Error message shown: ✅ / ❌
- [ ] Can retry payment: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

### Test 3: Cleaner Payout
- [ ] Payout calculated: ✅ / ❌
- [ ] 60/40 split correct: ✅ / ❌
- [ ] Payout sent: ✅ / ❌
- **Status:** PASS / FAIL
- **Notes:**

### Overall Payment System Status:
- [ ] READY FOR PRODUCTION ✅
- [ ] NEEDS FIXES ⚠️
- [ ] NOT READY ❌

### Critical Issues Found:
1. 
2. 
3. 

### Action Items:
- [ ] 
- [ ] 
- [ ] 

---

## 🎯 GO/NO-GO DECISION

### ✅ GO (Safe to accept customer payments) if:
- ✅ All 3 tests passed
- ✅ Webhook reliably received
- ✅ Bookings update correctly
- ✅ No critical errors in logs
- ✅ IntaSend dashboard shows transactions
- ✅ Revenue split calculated correctly

### ❌ NO-GO (Do not accept customer payments) if:
- ❌ Any test failed
- ❌ Webhook not received
- ❌ Booking not updating
- ❌ Errors in Render logs
- ❌ Wrong amounts processed
- ❌ Payment failures not handled

---

## 📞 SUPPORT CONTACTS

### IntaSend Support:
- **Email:** support@intasend.com
- **Phone:** +254 (20) 123-4567 (check their website for current)
- **Docs:** https://developers.intasend.com

### Common Questions to Ask IntaSend:
1. "Is my account fully verified for live transactions?"
2. "Why is my webhook not being called?"
3. "How do I test payouts before going live?"
4. "What's the difference between test and live mode?"

---

## 🎉 NEXT STEPS AFTER SUCCESSFUL TESTING

Once all tests pass:

1. **Document your configuration:**
   - API keys saved securely
   - Webhook URL confirmed
   - Test results documented

2. **Set up monitoring:**
   - Add payment error tracking
   - Monitor webhook failures
   - Alert on payment issues

3. **Create support procedures:**
   - How to refund customer
   - How to retry failed payment
   - How to manually payout cleaner

4. **Update user documentation:**
   - Payment methods accepted
   - Expected payment flow
   - What to do if payment fails

5. **Prepare for customer payments:**
   - Test with small bookings first
   - Monitor closely
   - Have support ready

---

## ⚠️ IMPORTANT REMINDERS

1. **Never skip payment testing** - It's the only way to verify your integration
2. **Test with real money** - Test mode doesn't validate actual payment flow
3. **Monitor webhooks closely** - They're critical for booking updates
4. **Keep API keys secure** - Never commit to git or share publicly
5. **Document everything** - You'll need this for troubleshooting later

---

## ✅ FINAL CHECKLIST

Before launching to customers:

- [ ] IntaSend account fully verified
- [ ] API keys in LIVE mode
- [ ] Webhook configured and tested
- [ ] Backend environment variables set
- [ ] Test payment completed successfully
- [ ] Webhook received and processed
- [ ] Booking status updated correctly
- [ ] Transaction recorded in database
- [ ] Payment failure handled gracefully
- [ ] Revenue split calculated correctly
- [ ] Cleaner payout tested (if applicable)
- [ ] All test results documented
- [ ] Support procedures created
- [ ] Monitoring configured

**If ALL boxes checked:** ✅ READY TO ACCEPT CUSTOMER PAYMENTS

**If ANY box unchecked:** ❌ CONTINUE TESTING

---

**Good luck with your payment testing! Take your time and test thoroughly. 💰**