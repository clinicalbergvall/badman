import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import LiveTracking from '@/components/LiveTracking'
import ChatBox from '@/components/ChatBox'
import VerificationBadge from '@/components/VerificationBadge'
import type { VerificationDetails } from '@/lib/types'
import { api } from '@/lib/api'
import { loadUserSession } from '@/lib/storage'

export default function ActiveBooking() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'tracking' | 'chat'>('tracking')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  const ChatBoxWithUserData = ({ bookingId }: { bookingId: string }) => {
    const userSession = loadUserSession()

    if (!userSession) {
      return <div className="p-4 text-center text-gray-500">Please log in to use chat</div>
    }

    return (
      <ChatBox
        bookingId={bookingId}
        currentUserId={userSession.phone}
        currentUserName={userSession.name}
        currentUserRole="cleaner"
      />
    )
  }

  useEffect(() => {

    const fetchBooking = async () => {
      try {
        const response = await api.get(id ? `/bookings/${id}` : "/bookings/active");

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.booking) {
            setBooking(data.booking)
          }
        }
      } catch (error) {

        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!booking) {
    return <div>No active booking found.</div>
  }

  const clientLocation = {
    latitude: booking.location?.coordinates?.[0] || -1.2921,
    longitude: booking.location?.coordinates?.[1] || 36.8219,
    address: booking.location?.address || booking.location?.manualAddress || 'Nairobi, Kenya',
    coordinates: booking.location?.coordinates || [-1.2921, 36.8219] as [number, number]
  }

  const cleanerVerification: VerificationDetails = {
    idVerified: true,
    idNumber: 'ID-12345678',
    policeCheck: true,
    references: [
      {
        id: '1',
        name: 'Jane Smith',
        phone: '0723456789',
        relationship: 'Previous Client',
        verified: true
      },
      {
        id: '2',
        name: 'Mike Johnson',
        phone: '0734567890',
        relationship: 'Colleague',
        verified: true
      }
    ],
    insuranceCoverage: false,
    verifiedAt: new Date().toISOString()
  }

  const handleReportIssue = () => {
    const details = window.prompt('Tell us what went wrong so support can reach out:')
    if (details && details.trim().length > 0) {
      window.alert('Thanks for the report. CleanCloak support will contact you shortly.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 md:p-6">
      <div className="w-full space-y-6">
        { }
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Active Booking</h1>
            <p className="text-sm text-gray-400">Booking #{booking.id.slice(0, 8)}</p>
          </div>
        </div>

        { }
        <Card className="p-6 bg-gray-800/90 border-gray-700 text-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {booking.cleanerName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{booking.cleanerName}</h2>
                  <p className="text-sm text-gray-400">{booking.cleanerPhone}</p>
                </div>
                <VerificationBadge verification={cleanerVerification} size="sm" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Service Package</p>
                    <p className="text-sm font-medium text-gray-100 capitalize">
                      {booking.carServicePackage?.replace(/-/g, " ") || booking.serviceCategory?.replace(/-/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Vehicle Type</p>
                    <p className="text-sm font-medium text-gray-100">{booking.vehicleType || "N/A"}</p>
                  </div>
                </div>

                {booking.paintCorrectionStage && (
                  <div>
                    <p className="text-xs text-gray-400">Paint Correction Stage</p>
                    <p className="text-sm font-medium text-gray-100">{booking.paintCorrectionStage.replace(/-/g, " ")}</p>
                  </div>
                )}
                
                {booking.fleetCarCount && (
                  <div>
                    <p className="text-xs text-gray-400">Fleet Size</p>
                    <p className="text-sm font-medium text-gray-100">{booking.fleetCarCount} Vehicles</p>
                  </div>
                )}

                {booking.selectedCarExtras && booking.selectedCarExtras.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Extras</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.selectedCarExtras.map((extra: string, i: number) => (
                        <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md capitalize">
                          {extra.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const telLink = `tel:${booking.cleanerPhone.replace(/\s+/g, '')}`
                    window.location.href = telLink
                  }}
                  aria-label={`Call ${booking.cleanerName}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Cleaner
                </Button>
                <Button
                  variant="outline"
                  className="px-4"
                  onClick={() => {

                    alert('Verification details modal would open here')
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        { }
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'tracking'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Live Tracking</span>
            </div>
            {activeTab === 'tracking' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'chat'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Chat</span>
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">2</span>
            </div>
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>
        </div>

        { }
        <div>
          {activeTab === 'tracking' ? (
            <LiveTracking
              bookingId={booking.id}
              clientLocation={clientLocation}
            />
          ) : (
            <ChatBoxWithUserData
              bookingId={booking.id}
            />
          )}
        </div>

        { }
        <Card className="p-4 bg-red-900/30 border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-100">Need Help?</p>
                <p className="text-sm text-green-700">CleanCloak support will contact you shortly.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-600 text-red-300 hover:bg-red-900/50"
              onClick={handleReportIssue}
            >
              Report Issue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
