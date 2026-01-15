import type { BookingHistoryItem } from '@/lib/types'

interface PaymentReceiptProps {
    booking: BookingHistoryItem & {
        transactionId?: string
        paidAt?: string
        cleaner?: {
            name: string
            phone: string
        }
    }
    onClose: () => void
}

export function PaymentReceipt({ booking, onClose }: PaymentReceiptProps) {
    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        const receiptUrl = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'CleanCloak Receipt',
                    text: `Receipt for booking #${booking.id?.slice(-8)}`,
                    url: receiptUrl
                })
            } catch (err) {
                console.log('Share cancelled')
            }
        } else {
            
            navigator.clipboard.writeText(receiptUrl)
            alert('Receipt link copied to clipboard!')
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    
    const totalAmount = booking.price
    const platformFee = Math.round(totalAmount * 0.6)
    const cleanerEarnings = Math.round(totalAmount * 0.4)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:w-full">
                {}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 print:bg-yellow-500">
                    <div className="flex items-center justify-between mb-4 print:mb-2">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">✅</div>
                            <div>
                                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                                <p className="text-yellow-100 text-sm">Thank you for your business</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-yellow-600 rounded-full p-2 transition print:hidden text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {}
                    <div className="bg-yellow-600 bg-opacity-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-yellow-100">Transaction ID</span>
                            <span className="font-mono font-semibold">{booking.transactionId || 'Processing...'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-yellow-100">Payment Date</span>
                            <span className="font-semibold">{formatDate(booking.paidAt)}</span>
                        </div>
                    </div>
                </div>

                {}
                <div className="p-6 space-y-6">
                    {}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            📋 Service Details
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {booking.serviceCategory?.replace('-', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Booking Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {booking.bookingType}
                                    </p>
                                </div>
                            </div>

                            {booking.scheduledDate && (
                                <div className="flex items-center gap-2 text-sm">
                                    📅 <span className="text-gray-700 dark:text-gray-300">
                                        Scheduled: {booking.scheduledDate} {booking.scheduledTime && `at ${booking.scheduledTime}`}
                                    </span>
                                </div>
                            )}

                            {booking.location?.address && (
                                <div className="flex items-start gap-2 text-sm">
                                    📍 <span className="text-gray-700 dark:text-gray-300">
                                        {booking.location.address}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    {booking.cleaner && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                👤 Service Provider
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="font-medium text-gray-900 dark:text-white">{booking.cleaner.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{booking.cleaner.phone}</p>
                            </div>
                        </div>
                    )}

                    {}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            💰 Payment Breakdown
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Service Charge</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    KSh  {totalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                <span>• Platform Fee (60%)</span>
                                <span>KSh {platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                <span>• Cleaner Earnings (40%)</span>
                                <span>KSh {cleanerEarnings.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-gray-900 dark:text-white">Total Paid</span>
                                    <span className="text-yellow-600 dark:text-yellow-500">
                                        KSh {totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    {booking.rating && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Rating</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className={i < booking.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                                                ⭐
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {booking.rating}/5
                                    </span>
                                </div>
                                {booking.review && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        "{booking.review}"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                       font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            🖨️ Print
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                       font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            📤 Share
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold 
                       py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>

                    {}
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p>Thank you for choosing CleanCloak!</p>
                        <p className="mt-1">For support, contact us at support@cleancloak.com</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
