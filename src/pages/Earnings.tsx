import { useEffect, useState } from 'react'
import { Card, Badge } from '@/components/ui'
import CleanerLayout from '@/components/CleanerLayout'
import { api } from '@/lib/api'
import { loadUserSession } from '@/lib/storage'
import { calculateCleanerPayout, formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface CompletedBooking {
    _id: string
    id?: string
    title?: string
    serviceCategory: string
    price: number
    completedAt: string
    paymentStatus?: string
    payoutStatus?: string
    paidAt?: string
    carServicePackage?: string
    vehicleType?: string
    cleaningCategory?: string
}

const formatBookingTitle = (booking: CompletedBooking) => {
    if (booking.title && !booking.title.toLowerCase().includes('car detailing')) return booking.title;
    
    if (booking.serviceCategory === 'car-detailing' || booking.carServicePackage) {
      const pkg = booking.carServicePackage?.replace(/-/g, ' ') || 'Car Service';
      const vehicle = booking.vehicleType ? ` (${booking.vehicleType})` : '';
      return (pkg + vehicle).toUpperCase();
    }
    
    if (booking.cleaningCategory) {
      return (booking.cleaningCategory.replace(/-/g, ' ') + ' Cleaning').toUpperCase();
    }
  
    return (booking.serviceCategory?.replace(/-/g, ' ') || 'Booking').toUpperCase();
};

export default function Earnings() {
    const [bookings, setBookings] = useState<CompletedBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingPayout: 0,
        jobsCompleted: 0
    })

    useEffect(() => {
        fetchEarnings()
    }, [])

    const fetchEarnings = async () => {
        try {
            const user = loadUserSession()
            if (!user) return

            const response = await api.get('/bookings')
            if (response.ok) {
                const data = await response.json()
                const allBookings = data.bookings || []
                
                // Filter for completed bookings only
                const completed = allBookings.filter((b: any) => 
                    b.status === 'completed'
                ).sort((a: any, b: any) => 
                    new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
                )

                setBookings(completed)
                calculateStats(completed)
            }
        } catch (error) {
            console.error('Failed to fetch earnings:', error)
            toast.error('Could not load earnings history')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (completedJobs: CompletedBooking[]) => {
        let total = 0
        let pending = 0

        completedJobs.forEach(job => {
            const earnings = calculateCleanerPayout(job.price)
            
            // If payout marked as completed (or paid via other mechanism), add to total
            // Otherwise if job is done but payout not sent, add to pending
            if (job.payoutStatus === 'completed') {
                total += earnings
            } else {
                pending += earnings
            }
        })

        setStats({
            totalEarned: total,
            pendingPayout: pending,
            jobsCompleted: completedJobs.length
        })
    }

    if (loading) {
        return (
            <CleanerLayout currentPage="earnings">
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                </div>
            </CleanerLayout>
        )
    }

    return (
        <CleanerLayout currentPage="earnings">
            <div className="space-y-6 pb-20">
                <div className="text-center animate-up">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Earnings</h1>
                    <p className="text-gray-600">Track your payouts and income history.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-green-50 border-green-100">
                        <p className="text-sm text-green-800 font-medium mb-1">Total Earned</p>
                        <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(stats.totalEarned)}
                        </p>
                    </Card>
                    <Card className="p-4 bg-yellow-50 border-yellow-100">
                        <p className="text-sm text-yellow-800 font-medium mb-1">Pending Payout</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {formatCurrency(stats.pendingPayout)}
                        </p>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Payouts</h2>
                    
                    {bookings.length === 0 ? (
                        <Card className="p-8 text-center border-dashed">
                            <span className="text-4xl block mb-2">💸</span>
                            <p className="text-gray-500">No completed jobs yet.</p>
                        </Card>
                    ) : (
                        bookings.map((job: CompletedBooking) => {
                            const earning = calculateCleanerPayout(job.price)
                            const isPaid = job.payoutStatus === 'completed'

                            return (
                                <Card key={job._id || job.id} className="p-4 flex justify-between items-center transition-shadow hover:shadow-md">
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {formatBookingTitle(job)}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {new Date(job.completedAt).toLocaleDateString()} at {new Date(job.completedAt).toLocaleTimeString()}
                                        </p>
                                        <div className="mt-1">
                                            {isPaid ? (
                                                <Badge variant="success" className="text-xs">Paid to M-Pesa</Badge>
                                            ) : (
                                                <Badge variant="warning" className="text-xs">Processing</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${isPaid ? 'text-green-600' : 'text-gray-600'}`}>
                                            +{formatCurrency(earning)}
                                        </p>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </CleanerLayout>
    )
}
