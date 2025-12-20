# 🧪 TESTING GUIDE - PAY AFTER COMPLETION WORKFLOW

**Date:** December 2024  
**Purpose:** Step-by-step testing guide for the pay-after-completion feature  
**Prerequisites:** Backend server running, MongoDB connected, Frontend dev server running

---

## 🎯 TESTING OVERVIEW

This guide will walk you through testing the complete pay-after-completion workflow from both client and cleaner perspectives.

---

## ⚙️ SETUP

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
# Server should run on http://localhost:5000
```

### 2. Start Frontend Server
```bash
cd clean-cloak
npm install
npm run dev
# Frontend should run on http://localhost:5173
```

### 3. Verify Environment Variables
```bash
# Backend .env file should have:
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
INTASEND_PUBLISHABLE_KEY=your_intasend_key
INTASEND_SECRET_KEY=your_intasend_secret
NODE_ENV=development

# Frontend .env file should have:
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 TEST SCENARIOS

## SCENARIO 1: CLIENT BOOKS SERVICE (NO PAYMENT)

### Expected Behavior:
✅ Client can book service without payment  
✅ Booking created with status: "pending"  
✅ No payment modal appears  
✅ Success message displayed  

### Steps:

1. **Navigate to Homepage**
   ```
   URL: http://localhost:5173/
   ```

2. **Select Service Category**
   - Choose "Car Detailing" or "Home Cleaning"

3. **Fill Booking Form**
   - **Car Detailing:**
     - Vehicle Type: SEDAN / MID-SUV / SUV-DOUBLE-CAB
     - Service Package: NORMAL-DETAIL / INTERIOR-STEAMING / etc.
     - Extras: Optional
   - **Home Cleaning:**
     - Category: HOUSE_CLEANING / FUMIGATION / etc.
     - Room size or items

4. **Select Booking Type**
   - Immediate or Scheduled (with date/time)

5. **Enter Contact Details**
   ```
   Name: Test Client
   Phone: 0712345678
   Email: client@test.com
   ```

6. **Enter Location**
   - Manual address or use location picker

7. **Submit Booking**
   - Click "Book Now" or "Confirm Booking"
   - ⚠️ **IMPORTANT:** No payment prompt should appear!

### Verification:
```bash
# Check MongoDB
db.bookings.findOne({ "client.phone": "0712345678" })

# Expected fields:
{
  status: "pending",
  paid: false,
  cleaner: null,
  paymentStatus: "pending",
  price: <calculated_price>
}
```

### Expected Messages:
```
✅ "Booking created successfully!"
✅ "A cleaner will accept your booking soon"
```

---

## SCENARIO 2: CLEANER ACCEPTS BOOKING

### Expected Behavior:
✅ Cleaner sees available bookings  
✅ Can accept booking  
✅ Booking assigned to cleaner  
✅ Status changes to "confirmed"  

### Steps:

1. **Login as Cleaner**
   ```
   URL: http://localhost:5173/jobs
   Email: cleaner@test.com
   Password: your_password
   ```

2. **View Available Jobs**
   - Navigate to "Available Jobs" page
   - Should see the booking created in Scenario 1

3. **Review Job Details**
   ```
   - Service type
   - Vehicle/room details
   - Location
   - Payout amount (60% of booking price)
   - Timing (immediate or scheduled)
   ```

4. **Accept Booking**
   - Click "Accept Job" button
   - Wait for confirmation

### API Call Made:
```http
POST /api/bookings/:id/accept
Authorization: Bearer <cleaner_token>
```

### Verification:
```bash
# Check MongoDB
db.bookings.findOne({ _id: ObjectId("booking_id") })

# Expected changes:
{
  status: "confirmed",        # Changed from "pending"
  cleaner: ObjectId("..."),   # Assigned cleaner ID
  acceptedAt: ISODate("...")  # Timestamp
}
```

### Expected Messages:
```
✅ "Booking accepted successfully! Client has been notified."
```

---

## SCENARIO 3: CLEANER MARKS JOB COMPLETE

### Expected Behavior:
✅ Cleaner can mark job complete  
✅ Optional: Upload before/after photos  
✅ Payment deadline set (2 hours)  
✅ Status changes to "completed"  

### Steps:

1. **Navigate to Active Jobs**
   ```
   URL: http://localhost:5173/cleaner-active
   ```

2. **Find Accepted Booking**
   - Should appear in "Active Jobs" section

3. **Click "Mark as Complete"**
   - Modal should appear

4. **Optional: Add Details**
   ```
   - Before photos (URLs or file upload)
   - After photos (URLs or file upload)
   - Completion notes: "Job completed successfully"
   ```

5. **Confirm Completion**
   - Click "Confirm Complete" button

### API Call Made:
```http
POST /api/bookings/:id/complete
Authorization: Bearer <cleaner_token>
Content-Type: application/json

{
  "notes": "Job completed successfully",
  "beforePhotos": [],
  "afterPhotos": []
}
```

### Verification:
```bash
# Check MongoDB
db.bookings.findOne({ _id: ObjectId("booking_id") })

# Expected changes:
{
  status: "completed",
  completedAt: ISODate("..."),
  paymentDeadline: ISODate("..."),  # 2 hours from completedAt
  completionNotes: "Job completed successfully"
}
```

### Expected Messages:
```
✅ "Job marked as complete! Client will be notified."
```

---

## SCENARIO 4: CLIENT RATES SERVICE

### Expected Behavior:
✅ Client can view completed booking  
✅ Rating modal appears  
✅ Can select 1-5 stars  
✅ Optional review text  
✅ Rating required before payment  

### Steps:

1. **Navigate to Completed Bookings**
   ```
   URL: http://localhost:5173/completed-bookings
   ```

2. **Find Completed Booking**
   - Should appear in "Awaiting Payment" section
   - Shows payment deadline countdown

3. **Click "Rate Service"**
   - Rating modal appears

4. **Select Rating**
   ```
   - Click on stars (1-5)
   - 1 = Poor
   - 2 = Fair
   - 3 = Good
   - 4 = Very Good
   - 5 = Excellent
   ```

5. **Add Review (Optional)**
   ```
   Example: "Excellent service! Very professional and thorough."
   Max: 500 characters
   ```

6. **Submit Rating**
   - Click "Submit Rating" button

### API Call Made:
```http
POST /api/bookings/:id/rating
Authorization: Bearer <client_token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent service! Very professional and thorough."
}
```

### Verification:
```bash
# Check MongoDB
db.bookings.findOne({ _id: ObjectId("booking_id") })

# Expected changes:
{
  rating: 5,
  review: "Excellent service! Very professional and thorough."
}

# Also check cleaner profile rating updated
db.cleanerprofiles.findOne({ user: ObjectId("cleaner_id") })
# Average rating should be recalculated
```

### Expected Messages:
```
✅ "Rating submitted successfully! ⭐"
```

---

## SCENARIO 5: CLIENT MAKES PAYMENT

### Expected Behavior:
✅ "Pay Now" button active after rating  
✅ Payment modal appears  
✅ M-Pesa STK push sent  
✅ Payment processed (60/40 split)  
✅ Booking marked as paid  

### Steps:

1. **On Completed Bookings Page**
   - Booking should now show "✓ Rated" badge

2. **Click "Pay Now"**
   - Payment modal opens
   - Shows booking details and amount

3. **Verify Payment Details**
   ```
   - Service type
   - Cleaner name
   - Total amount
   - Payment method: M-Pesa
   ```

4. **Initiate Payment**
   - Click "Pay with M-Pesa" button
   - Enter phone number (if not pre-filled)
   - Click "Send Payment Request"

5. **Complete M-Pesa Payment**
   ```
   - Check phone for M-Pesa STK push
   - Enter M-Pesa PIN
   - Confirm payment
   ```

### API Call Made:
```http
POST /api/bookings/:id/pay
Authorization: Bearer <client_token>
Content-Type: application/json

# IntaSend STK Push initiated
{
  "amount": booking.price,
  "phone": client.phone,
  "reference": "JOB_<booking_id>",
  "metadata": {
    "booking_id": "...",
    "split": {
      "cleaner_phone": "...",
      "percentage": 60,
      "cleaner_payout": <calculated>
    }
  }
}
```

### Verification:
```bash
# Check MongoDB after payment webhook
db.bookings.findOne({ _id: ObjectId("booking_id") })

# Expected changes:
{
  paid: true,
  paidAt: ISODate("..."),
  paymentStatus: "paid",
  totalPrice: <original_price>,
  platformFee: <40%>,
  cleanerPayout: <60%>,
  transactionId: "..."
}
```

### Expected Messages:
```
✅ "STK Push sent – check your phone"
✅ "Payment successful! 🎉"
✅ "Thank you for your payment"
```

---

## 🚨 ERROR SCENARIOS TO TEST

### Test 1: Try to Pay Without Rating
**Steps:**
1. Complete booking (as cleaner)
2. Try to click "Pay Now" (as client) WITHOUT rating

**Expected:**
```
❌ "Please rate the service before making payment"
→ Rating modal should open automatically
```

### Test 2: Try to Accept Already-Accepted Booking
**Steps:**
1. Cleaner A accepts booking
2. Cleaner B tries to accept same booking

**Expected:**
```
❌ "This booking has already been accepted by another cleaner"
→ Booking should disappear from Cleaner B's available jobs
```

### Test 3: Try to Complete Non-Assigned Booking
**Steps:**
1. Cleaner tries to complete booking not assigned to them

**Expected:**
```
❌ "Not authorized to complete this booking"
→ 403 Forbidden error
```

### Test 4: Try to Rate Already-Paid Booking
**Steps:**
1. Complete and pay for booking
2. Try to rate again

**Expected:**
```
⚠️ Rating should be view-only or show "Already rated"
```

### Test 5: Payment After Deadline
**Steps:**
1. Complete booking
2. Wait 2+ hours (or manually modify paymentDeadline in DB)
3. Try to pay

**Expected:**
```
⚠️ Warning shown: "Payment deadline has passed"
✅ Payment still allowed (with paymentLate flag)
```

---

## 🔍 MONITORING & DEBUGGING

### Check Backend Logs
```bash
# Look for these log messages:
✅ Booking ${booking._id} accepted by cleaner ${cleaner_id}
✅ Booking ${booking._id} marked as completed by cleaner
⏰ Payment deadline set to: ${paymentDeadline}
⚠️ Payment deadline exceeded for booking ${booking._id}
```

### Check Database State
```javascript
// Find all bookings by status
db.bookings.find({ status: "pending" }).count()
db.bookings.find({ status: "confirmed" }).count()
db.bookings.find({ status: "completed" }).count()
db.bookings.find({ paid: true }).count()

// Find unpaid completed bookings
db.bookings.find({
  status: "completed",
  paid: false
})

// Find overdue payments
db.bookings.find({
  status: "completed",
  paid: false,
  paymentDeadline: { $lt: new Date() }
})
```

### Check API Responses
```bash
# Test endpoints with curl

# Accept booking
curl -X POST http://localhost:5000/api/bookings/{id}/accept \
  -H "Authorization: Bearer {cleaner_token}"

# Complete booking
curl -X POST http://localhost:5000/api/bookings/{id}/complete \
  -H "Authorization: Bearer {cleaner_token}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Test completion"}'

# Rate booking
curl -X POST http://localhost:5000/api/bookings/{id}/rating \
  -H "Authorization: Bearer {client_token}" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "review": "Great!"}'

# Get unpaid bookings
curl http://localhost:5000/api/bookings/unpaid \
  -H "Authorization: Bearer {client_token}"
```

---

## ✅ TESTING CHECKLIST

### Backend Tests:
- [ ] Booking created without payment
- [ ] Cleaner can view opportunities
- [ ] Cleaner can accept booking
- [ ] Only assigned cleaner can complete
- [ ] Payment deadline calculated correctly
- [ ] Rating validates completion
- [ ] Payment requires rating
- [ ] 60/40 split calculated correctly
- [ ] Late payments flagged but allowed

### Frontend Tests:
- [ ] No payment modal on booking creation
- [ ] Available jobs page shows bookings
- [ ] Accept button works
- [ ] Complete modal opens
- [ ] Rating modal displays correctly
- [ ] Star rating interactive
- [ ] Payment modal shows correct amount
- [ ] Deadline countdown accurate
- [ ] Paid bookings move to history

### Integration Tests:
- [ ] End-to-end flow: Book → Accept → Complete → Rate → Pay
- [ ] Multiple cleaners competing for same job
- [ ] Multiple bookings for same client
- [ ] Payment webhook updates booking
- [ ] Cleaner rating updates after client rating

### Edge Cases:
- [ ] Rating without payment
- [ ] Payment without rating (should fail)
- [ ] Accepting already-accepted booking (should fail)
- [ ] Completing non-assigned booking (should fail)
- [ ] Payment after deadline (should warn but allow)
- [ ] Duplicate payment attempts (should prevent)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Booking Not Appearing in Cleaner Feed
**Cause:** Status not "pending" or cleaner already assigned  
**Solution:** Check booking status in DB, ensure cleaner is null

### Issue 2: Cannot Accept Booking
**Cause:** Authentication issue or booking already accepted  
**Solution:** Check auth token, verify booking still available

### Issue 3: Rating Modal Not Opening
**Cause:** Booking not completed or component import issue  
**Solution:** Verify booking status is "completed", check console for errors

### Issue 4: Payment Fails
**Cause:** IntaSend credentials, phone format, or insufficient funds  
**Solution:** 
- Verify INTASEND_* environment variables
- Check phone format: 0712345678 or 254712345678
- Use test mode with IntaSend sandbox

### Issue 5: Deadline Not Showing
**Cause:** paymentDeadline not set or timezone issue  
**Solution:** Check completedAt and paymentDeadline fields in DB

---

## 📊 SUCCESS METRICS

After testing, verify these metrics:

✅ **Booking Conversion:** 100% of bookings created without payment  
✅ **Acceptance Time:** Cleaners can accept within seconds  
✅ **Completion Rate:** Cleaners can complete and submit  
✅ **Rating Rate:** Clients rate before paying  
✅ **Payment Success:** M-Pesa integration works  
✅ **Payout Accuracy:** 60/40 split calculated correctly  

---

## 🎓 TRAINING USERS

### For Clients:
```
1. Book any service - no payment needed!
2. Wait for cleaner to accept
3. Cleaner completes the work
4. Rate your experience (required)
5. Pay securely via M-Pesa
6. Done! ✨
```

### For Cleaners:
```
1. Browse available jobs
2. Accept jobs you can handle
3. Complete the work professionally
4. Mark as complete (add photos if possible)
5. Client pays within 2 hours
6. Receive 60% payout automatically
7. Build your rating! ⭐
```

---

## 📞 SUPPORT

If issues persist:

1. Check backend logs: `npm start`
2. Check browser console: F12 → Console
3. Verify MongoDB connection
4. Check environment variables
5. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## ✨ NEXT STEPS AFTER TESTING

1. ✅ Fix any bugs found during testing
2. ✅ Deploy to staging environment
3. ✅ Test with real M-Pesa transactions (small amounts)
4. ✅ Train support team on new flow
5. ✅ Create user documentation
6. ✅ Deploy to production
7. ✅ Monitor metrics closely
8. 🚀 Implement Phase 2 (notifications, disputes)

---

**Happy Testing! 🎉**

**Last Updated:** December 2024  
**Version:** 1.0  
**Questions?** Refer to IMPLEMENTATION_SUMMARY.md