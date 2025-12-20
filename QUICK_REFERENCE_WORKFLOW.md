# 🚀 QUICK REFERENCE - PAY AFTER COMPLETION WORKFLOW

**Last Updated:** December 2024  
**One-page guide for developers and support team**

---

## 📱 CLIENT FLOW

```
1. 📝 BOOK SERVICE (NO PAYMENT)
   ↓
2. 🔔 "Cleaner accepted!" notification
   ↓
3. 🚗 "Cleaner on the way" notification
   ↓
4. ✅ Cleaner completes work
   ↓
5. 🔔 "Service completed! Rate & Pay"
   ↓
6. ⭐ RATE SERVICE (1-5 stars + review)
   ↓
7. 💳 PAY NOW (M-Pesa STK Push)
   ↓
8. 🧾 Receipt & Thank You
```

**Key Pages:**
- `/` - Book service
- `/completed-bookings` - Rate & Pay
- `/profile` - View history

---

## 🧹 CLEANER FLOW

```
1. 👀 VIEW AVAILABLE JOBS
   ↓
2. ✅ ACCEPT BOOKING
   ↓
3. 🚗 Travel to location
   ↓
4. 🧹 Complete work
   ↓
5. 📸 MARK AS COMPLETE (+ photos)
   ↓
6. ⏰ Client has 2 hours to pay
   ↓
7. 💰 RECEIVE 60% PAYOUT
```

**Key Pages:**
- `/jobs` - Browse available jobs
- `/cleaner-active` - Active jobs & complete
- `/earnings` - View payouts

---

## 🔗 API ENDPOINTS

### Client Endpoints
```http
POST   /api/bookings/public         # Create booking (no auth)
POST   /api/bookings                # Create booking (auth)
GET    /api/bookings                # Get my bookings
GET    /api/bookings/unpaid         # Unpaid completed bookings
POST   /api/bookings/:id/rating     # Rate service (REQUIRED before pay)
POST   /api/bookings/:id/pay        # Process payment
```

### Cleaner Endpoints
```http
GET    /api/bookings/opportunities  # Available jobs
POST   /api/bookings/:id/accept     # Accept booking
POST   /api/bookings/:id/complete   # Mark complete
PUT    /api/bookings/:id/status     # Update status
```

### Shared
```http
GET    /api/bookings/:id            # Get booking details
```

---

## 📊 BOOKING STATUS FLOW

```
pending → confirmed → in-progress → completed → (paid)
   ↓         ↓            ↓             ↓          ↓
Created   Accepted    Optional      Marked     Payment
by Client by Cleaner  Update       Complete   Received
```

---

## 💰 PAYMENT SPLIT

```
Total Booking Price: 100%
├─ Platform Fee: 40%
└─ Cleaner Payout: 60%

Example: KES 5,000
├─ Platform: KES 2,000
└─ Cleaner: KES 3,000
```

---

## ⏰ PAYMENT DEADLINE

```
Completion Time: 12:00 PM
Payment Deadline: 2:00 PM (2 hours later)

Timeline:
├─ 0-1.5h: Normal (gray badge)
├─ 1.5-2h: Warning (yellow badge)
└─ 2h+: Overdue (red badge, pulsing)

Note: Payment still allowed after deadline
```

---

## ⭐ RATING SYSTEM

```
Required: Yes (must rate before payment)
Range: 1-5 stars
Review: Optional (max 500 chars)

1 ⭐ = Poor
2 ⭐⭐ = Fair
3 ⭐⭐⭐ = Good
4 ⭐⭐⭐⭐ = Very Good
5 ⭐⭐⭐⭐⭐ = Excellent
```

---

## 🔐 VALIDATIONS

### Accept Booking
- ✅ Must be cleaner
- ✅ Booking status = "pending"
- ✅ No cleaner assigned yet

### Complete Booking
- ✅ Must be assigned cleaner
- ✅ Booking not already completed

### Rate Service
- ✅ Must be booking's client
- ✅ Booking status = "completed"
- ✅ Rating 1-5 required

### Process Payment
- ✅ Must be booking's client
- ✅ Must have rated service
- ✅ Booking status = "completed"
- ✅ Not already paid

---

## 🧪 QUICK TEST

### Test 1: Happy Path
```bash
1. Create booking → Check: no payment prompt
2. Login as cleaner → Accept booking
3. Mark complete → Check: deadline set
4. Login as client → Rate service (5 stars)
5. Pay now → Check: 60/40 split
```

### Test 2: Error Cases
```bash
1. Try pay without rating → Should fail
2. Two cleaners accept same job → Second should fail
3. Payment after deadline → Should warn but allow
```

---

## 🐛 COMMON ISSUES

| Issue | Cause | Solution |
|-------|-------|----------|
| No payment prompt on booking | ✅ Working as intended | This is correct! |
| Can't accept booking | Already accepted | Refresh job list |
| Can't pay | Not rated yet | Rate service first |
| Payment fails | IntaSend config | Check API keys |
| Deadline not showing | Not completed yet | Cleaner must complete first |

---

## 📝 DATABASE FIELDS

### Critical Booking Fields
```javascript
{
  client: ObjectId,          // Who booked
  cleaner: ObjectId,         // Who accepted (null if pending)
  status: String,            // pending/confirmed/completed
  price: Number,             // Base price
  totalPrice: Number,        // Same as price
  platformFee: Number,       // 40% of price
  cleanerPayout: Number,     // 60% of price
  rating: Number,            // 1-5 (required before payment)
  review: String,            // Optional feedback
  paid: Boolean,             // Payment status
  paidAt: Date,              // When paid
  completedAt: Date,         // When completed
  paymentDeadline: Date,     // completedAt + 2 hours
  paymentLate: Boolean,      // True if paid after deadline
  acceptedAt: Date,          // When cleaner accepted
  beforePhotos: [String],    // Optional
  afterPhotos: [String],     // Optional
  completionNotes: String    // Optional
}
```

---

## 🎯 SUCCESS CRITERIA

✅ Client books without payment  
✅ Cleaner accepts and completes  
✅ Client rates before paying  
✅ Payment processes successfully  
✅ 60/40 split accurate  
✅ Deadline tracked correctly  

---

## 📱 COMPONENT TREE

```
Frontend Components:
├─ BookingEnhanced.tsx          # Create booking (NO payment)
├─ ClientCompletedBookings.tsx  # View completed, rate & pay
├─ RatingModal.tsx              # Rate service modal
├─ PaymentModal.tsx             # Payment interface
├─ cleanersjob.tsx              # Available jobs (cleaners)
└─ CleanerActiveBookings.tsx    # Complete jobs (cleaners)
```

---

## 🚨 CRITICAL REMINDERS

1. **NO PAYMENT ON BOOKING** - This is the whole point!
2. **RATING IS REQUIRED** - Must rate before paying
3. **2 HOUR DEADLINE** - Soft limit, not enforced
4. **60/40 SPLIT** - Cleaner gets 60%, platform 40%
5. **AUTO-NOTIFY** - Coming in Phase 2 (notifications)

---

## 📞 SUPPORT QUICK RESPONSES

**Q: "Why can't I pay now?"**  
A: "Please rate the service first, then payment will be available."

**Q: "Where do I rate the service?"**  
A: "Go to Completed Bookings page and click 'Rate Service'."

**Q: "When will I get paid?" (Cleaner)**  
A: "As soon as the client pays, you'll receive 60% automatically."

**Q: "I missed the 2-hour deadline"**  
A: "That's okay! You can still pay, there's no penalty."

---

## 🔗 RELATED DOCS

- **Full Documentation:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Testing Guide:** [TESTING_GUIDE_PAY_AFTER.md](./TESTING_GUIDE_PAY_AFTER.md)
- **Backend Details:** [BACKEND_ANALYSIS.md](./BACKEND_ANALYSIS.md)

---

## 📊 MONITORING COMMANDS

```bash
# Check booking statuses
db.bookings.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

# Find unpaid completed bookings
db.bookings.find({ status: "completed", paid: false }).count()

# Find overdue payments
db.bookings.find({
  paid: false,
  paymentDeadline: { $lt: new Date() }
})

# Average rating per cleaner
db.cleanerprofiles.find({}, { firstName: 1, rating: 1, totalJobs: 1 })
```

---

## ✨ KEY FEATURES

🎯 **Trust-Building:** No upfront payment  
⭐ **Quality Control:** Rating required before payment  
💰 **Fair Split:** 60% to cleaner, 40% platform  
⏰ **Soft Deadline:** 2 hours recommended, not enforced  
📸 **Photo Evidence:** Optional before/after photos  
🔒 **Secure:** JWT auth + httpOnly cookies  

---

**Print this page for quick reference! 🖨️**

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Maintained by:** Clean Cloak Engineering Team