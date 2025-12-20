# 🚨 Clean Cloak - Payment System Quick Fix Guide

**CRITICAL:** Your payment system is 60% complete and **WILL NOT WORK** without these fixes.

**Date:** December 7, 2025  
**Priority:** 🔴 BLOCKING - Must fix before any launch  
**Time Required:** 6-8 hours

---

## 🎯 THE PROBLEM

### What You Have:
- ✅ Webhook handler (receives payment confirmations)
- ✅ 60/40 revenue split logic
- ✅ Payout code
- ✅ Transaction models

### What's Missing (CRITICAL):
- ❌ **No way to initiate payments** (no STK Push trigger)
- ❌ **No payment UI** (users can't pay)
- ❌ **No payment status checking** (can't verify payment completion)
- ❌ **Wrong environment variable names** (IntaSend SDK won't work)

### Current User Experience:
1. User fills booking form ✅
2. Booking created ✅
3. User sees "Booking confirmed!" ❌ **MISLEADING**
4. **Payment NEVER happens** ❌
5. Booking stays unpaid forever ❌
6. **NO REVENUE** ❌

---

## 🛠️ THE FIX (3 Files to Create/Modify)

### Fix #1: Backend Payment Initiation (30 minutes)

**File:** `backend/routes/payments.js`

Add this endpoint at the TOP of the file (after the webhook):

```javascript
// CRITICAL: Payment Initiation Endpoint
router.post('/initiate', protect, async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body;
    
    // Get booking
    const booking = await Booking.findOne({
      _id: bookingId,
      client: req.user.id,
      paymentStatus: 'pending'
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already paid'
      });
    }
    
    // Initialize IntaSend (FIX: Use INTASEND_PUBLIC_KEY not PUBLISHABLE)
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLIC_KEY,        // ✅ FIXED
      process.env.INTASEND_SECRET_KEY,
      process.env.NODE_ENV !== 'production'
    );
    
    // Format phone: 254XXXXXXXXX
    const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
    
    // Trigger M-Pesa STK Push
    const collection = intasend.collection();
    const response = await collection.mpesaStkPush({
      amount: booking.price,
      phone_number: formattedPhone,
      api_ref: bookingId,
      callback_url: `${process.env.BACKEND_URL || 'https://clean-cloak-b.onrender.com'}/api/payments/webhook`,
      metadata: {
        booking_id: bookingId,
        client_id: req.user.id.toString(),
        service: booking.serviceCategory
      }
    });
    
    console.log('✅ STK Push initiated:', response);
    
    res.json({
      success: true,
      message: 'STK push sent. Check your phone.',
      paymentReference: response.invoice?.invoice_id || response.id,
      tracking_id: response.tracking_id
    });
    
  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});

// Payment Status Check Endpoint
router.get('/status/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      client: req.user.id
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      paid: booking.paid,
      paidAt: booking.paidAt,
      transactionId: booking.transactionId
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
});
```

**ALSO FIX:** Line 145 in same file - change variable name:

```javascript
// OLD (WRONG):
const client = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY,  // ❌

// NEW (CORRECT):
const client = new IntaSend(
  process.env.INTASEND_PUBLIC_KEY,  // ✅
```

---

### Fix #2: Frontend Payment Component (3 hours)

**Create:** `src/components/PaymentModal.tsx`

```typescript
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/config'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  bookingId: string
  amount: number
  phoneNumber: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentModal({ 
  bookingId, 
  amount, 
  phoneNumber, 
  onSuccess, 
  onCancel 
}: PaymentModalProps) {
  const [status, setStatus] = useState<'initiating' | 'waiting' | 'success' | 'failed'>('initiating')
  const [message, setMessage] = useState('Initiating payment...')
  const [countdown, setCountdown] = useState(120) // 2 minutes

  useEffect(() => {
    initiatePayment()
  }, [])

  const initiatePayment = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ bookingId, phoneNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      setStatus('waiting')
      setMessage('Check your phone for M-Pesa prompt...')
      
      // Start polling
      startPolling()
      
      // Start countdown
      startCountdown()

    } catch (error) {
      setStatus('failed')
      setMessage(error instanceof Error ? error.message : 'Payment failed')
      toast.error('Failed to initiate payment')
    }
  }

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startPolling = () => {
    let pollCount = 0
    const maxPolls = 40 // 40 x 3 seconds = 2 minutes

    const interval = setInterval(async () => {
      pollCount++

      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        
        const response = await fetch(
          `${API_BASE_URL}/payments/status/${bookingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }
        )

        const data = await response.json()

        if (data.paid) {
          clearInterval(interval)
          setStatus('success')
          setMessage('Payment successful! 🎉')
          toast.success('Payment completed')
          setTimeout(onSuccess, 2000)
        } else if (data.paymentStatus === 'failed') {
          clearInterval(interval)
          setStatus('failed')
          setMessage('Payment failed. Please try again.')
          toast.error('Payment failed')
        } else if (pollCount >= maxPolls) {
          clearInterval(interval)
          setStatus('failed')
          setMessage('Payment timeout. If money was deducted, contact support.')
          toast.error('Payment timeout')
        }

      } catch (error) {
        console.error('Polling error:', error)
      }

    }, 3000) // Poll every 3 seconds
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {status === 'success' ? '✅ Payment Successful' : 
           status === 'failed' ? '❌ Payment Failed' : 
           '⏳ Processing Payment'}
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">{message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Amount: <span className="font-bold">KSh {amount.toLocaleString()}</span>
          </p>
          {status === 'waiting' && countdown > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        {status === 'waiting' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                📱 M-Pesa Payment Instructions:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-400 ml-4 space-y-1 list-decimal">
                <li>Check your phone for M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN</li>
                <li>Confirm the payment</li>
                <li>Wait for confirmation message</li>
              </ol>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded p-4 mb-4">
            <p className="text-green-800 dark:text-green-300 text-center">
              ✅ Your booking is confirmed and paid!
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded p-4 mb-4">
            <p className="text-red-800 dark:text-red-300 text-sm">
              ⚠️ If money was deducted from your account, please contact support with booking ID: {bookingId.slice(-8)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {status === 'failed' && (
            <>
              <button
                onClick={() => {
                  setStatus('initiating')
                  setMessage('Retrying payment...')
                  setCountdown(120)
                  initiatePayment()
                }}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Retry Payment
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </>
          )}

          {status === 'waiting' && (
            <button
              onClick={onCancel}
              className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          )}

          {status === 'success' && (
            <button
              onClick={onSuccess}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### Fix #3: Update BookingEnhanced.tsx (1 hour)

**File:** `src/pages/BookingEnhanced.tsx`

**Step 1:** Import the PaymentModal at the top:

```typescript
// Add after other imports
import { PaymentModal } from '@/components/PaymentModal'
```

**Step 2:** Add state for payment modal (around line 149):

```typescript
// Add after other useState declarations
const [showPaymentModal, setShowPaymentModal] = useState(false)
const [currentBookingId, setCurrentBookingId] = useState('')
const [currentBookingAmount, setCurrentBookingAmount] = useState(0)
```

**Step 3:** Modify handleSubmit function (around line 370-395):

Replace the success handling section with:

```typescript
// After: const data = await response.json()
const bookingRecord = data.booking || data

// DON'T show success toast yet
// DON'T reset form yet

// Save booking for history
saveBooking(bookingRecord as any)
addToHistory(bookingRecord as any)

// Remember session
rememberSession({
  userType: 'client',
  name: name.trim() || bookingRecord.contact?.name,
  phone,
  email
})

// CRITICAL: Show payment modal instead of success message
setCurrentBookingId(bookingRecord._id || bookingRecord.id)
setCurrentBookingAmount(totalPrice)
setShowPaymentModal(true)

// Remove the toast.success and setTimeout here
```

**Step 4:** Add payment modal render (at the end of the return statement, before closing div):

```typescript
{/* Payment Modal */}
{showPaymentModal && (
  <PaymentModal
    bookingId={currentBookingId}
    amount={currentBookingAmount}
    phoneNumber={phone}
    onSuccess={() => {
      setShowPaymentModal(false)
      toast.success('🎉 Booking confirmed and paid!')
      
      // NOW reset form
      setTimeout(() => {
        setStep(1)
        setName('')
        setPhone('')
        setEmail('')
        setVehicleType('')
        setCarServicePackage('')
        setPaintStage('')
        setMidSUVTier('STANDARD')
        setFleetCarCount(5)
        setSelectedCarExtras([])
        setCleaningCategory('')
        setHouseCleaningType('')
        setFumigationType('')
        setRoomSize('')
        setBathroomItems({ general: false, sink: false, toilet: false })
        setWindowCount({ small: 0, large: 0, wholeHouse: false })
      }, 1000)
    }}
    onCancel={() => {
      setShowPaymentModal(false)
      toast.error('Payment cancelled. Your booking is saved but unpaid.')
    }}
  />
)}
```

---

## 🔧 ENVIRONMENT VARIABLES FIX

### On Render Dashboard:

**CRITICAL:** Change this environment variable name:

❌ **REMOVE:** `INTASEND_PUBLISHABLE_KEY`  
✅ **ADD:** `INTASEND_PUBLIC_KEY`

Your backend .env should have:
```bash
INTASEND_PUBLIC_KEY=ISPubKey_live_xxxxxxxxxxxxx
INTASEND_SECRET_KEY=ISSecKey_live_xxxxxxxxxxxxx
INTASEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
BACKEND_URL=https://clean-cloak-b.onrender.com
```

**After changing, redeploy backend!**

---

## ✅ TESTING PROCEDURE

### 1. Deploy Changes (10 minutes)

```powershell
# Frontend
cd C:\Users\king\Desktop\cloak\clean-cloak
npm run build
netlify deploy --prod --dir=dist

# Backend (if you changed routes/payments.js)
# Push to GitHub, Render will auto-deploy
```

### 2. Test Payment Flow (20 minutes)

**Test with REAL MONEY (KSh 50-100):**

1. Go to your site
2. Login as client
3. Create booking (choose cheapest service)
4. Fill all details
5. Submit booking
6. **NEW:** Payment modal should appear ✅
7. Click "Continue" or "Pay Now"
8. Check your phone for STK push (within 60 seconds)
9. Enter M-Pesa PIN
10. Confirm payment
11. Wait for success message (10-30 seconds)
12. Verify booking shows as "Paid" in dashboard

### 3. Check Backend Logs

On Render dashboard:
```
Expected logs:
[INFO] ✅ STK Push initiated
[INFO] Webhook received from IntaSend
[INFO] Payment verified
[INFO] Booking updated: status=paid
```

### 4. Verify in Database

MongoDB Atlas:
```javascript
// Bookings collection
{
  paymentStatus: "paid",
  paid: true,
  paidAt: [timestamp],
  transactionId: "MPESA_XXXXX"
}

// Transactions collection
{
  type: "payment",
  status: "completed",
  amount: [amount],
  metadata: { ... }
}
```

---

## 🚨 TROUBLESHOOTING

### Issue: STK Push Not Received

**Possible causes:**
1. Wrong phone number format
2. IntaSend API keys incorrect
3. M-Pesa integration not active

**Fix:**
- Verify phone format: 254XXXXXXXXX (no +, no spaces)
- Check IntaSend dashboard: Settings → M-Pesa
- Verify API keys are LIVE mode

---

### Issue: Payment Modal Doesn't Appear

**Possible causes:**
1. BookingEnhanced.tsx not updated correctly
2. PaymentModal.tsx not created
3. Import path wrong

**Fix:**
- Check browser console for errors
- Verify PaymentModal.tsx exists in src/components/
- Check import path matches your folder structure

---

### Issue: Webhook Not Received

**Possible causes:**
1. Webhook URL not configured in IntaSend
2. Backend URL incorrect
3. Webhook secret mismatch

**Fix:**
- IntaSend dashboard → Webhooks → Verify URL
- URL should be: https://clean-cloak-b.onrender.com/api/payments/webhook
- Check webhook secret matches .env

---

### Issue: "Invalid signature" Error

**Possible causes:**
1. INTASEND_WEBHOOK_SECRET not set
2. Webhook secret doesn't match IntaSend

**Fix:**
- Copy webhook secret from IntaSend
- Add to Render environment variables
- Redeploy backend

---

## 📊 VERIFICATION CHECKLIST

Before considering payment system complete:

- [ ] Payment initiation endpoint created
- [ ] Payment status endpoint created
- [ ] PaymentModal component created
- [ ] BookingEnhanced.tsx updated
- [ ] Environment variables fixed (INTASEND_PUBLIC_KEY)
- [ ] Backend redeployed
- [ ] Frontend rebuilt and deployed
- [ ] Test payment with real money (KSh 50)
- [ ] STK push received on phone
- [ ] Payment completed successfully
- [ ] Webhook callback received
- [ ] Booking status updated to "paid"
- [ ] Transaction recorded in database
- [ ] User sees success confirmation

---

## ⏱️ TIME ESTIMATE

**Backend Changes:** 30-45 minutes
- Payment initiation endpoint: 20 min
- Payment status endpoint: 10 min
- Environment variable fix: 5 min

**Frontend Changes:** 3-4 hours
- Create PaymentModal component: 2 hours
- Update BookingEnhanced.tsx: 1 hour
- Testing and bug fixes: 1 hour

**Testing:** 1 hour
- Real payment test: 30 min
- Verify all flows: 30 min

**TOTAL:** 5-6 hours

---

## 🎯 SUCCESS CRITERIA

Your payment system is working when:

✅ User creates booking  
✅ Payment modal appears automatically  
✅ User receives STK push on phone within 60 seconds  
✅ User enters PIN and confirms  
✅ Modal shows "Payment successful"  
✅ Booking status becomes "paid"  
✅ Transaction appears in database  
✅ Webhook received in backend logs  
✅ User can view paid booking  

---

## 🚀 AFTER COMPLETION

Once all fixes are implemented and tested:

1. **Monitor closely** for first 24 hours
2. **Check Render logs** regularly
3. **Verify webhook reliability** (100% callback rate expected)
4. **Test on multiple devices** (Android, iPhone, desktop)
5. **Document any issues** for quick resolution

---

## 📞 NEED HELP?

### Quick Reference:
- **IntaSend Docs:** https://developers.intasend.com/docs/apis/send-payment-request
- **Render Logs:** https://dashboard.render.com → Your Service → Logs
- **MongoDB Atlas:** https://cloud.mongodb.com → Your Cluster → Collections

### Common IntaSend API Endpoints:
```
Collection (STK Push): intasend.collection().mpesaStkPush(...)
Transfer (Payout): intasend.transfer().mpesa(...)
```

### Test Card (if using card payments):
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
```

---

**Remember:** Without these fixes, your payment system WILL NOT WORK. Users can create bookings but cannot pay. Fix these 3 things and you'll have a fully functional payment system! 🚀

**Priority:** 🔴 CRITICAL - Complete before any beta testing or launch

**Estimated Impact:** Enables 100% of revenue generation

**Last Updated:** December 7, 2025