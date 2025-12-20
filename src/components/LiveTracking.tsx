import { useState, useEffect } from 'react'
import { Card } from './ui'
import type { TrackingData, Location } from '@/lib/types'
import { loadUserSession, getStoredAuthToken } from '@/lib/storage'
import { api } from '@/lib/api'

interface LiveTrackingProps {
  bookingId: string
  clientLocation: Location
}

export default function LiveTracking({ bookingId, clientLocation }: LiveTrackingProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch real tracking data from API
    const fetchTrackingData = async () => {
      try {
        const response = await api.get(`/tracking/${bookingId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tracking) {
            setTracking(data.tracking)
          }
        } else {
          // If no tracking data exists, show not available
          setTracking(null)
        }
      } catch (error) {
        // On error, set tracking to null
        setTracking(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrackingData()

    // Simulate location updates every 10 seconds
    const interval = setInterval(() => {
      setTracking(prev => prev ? {
        ...prev,
        lastUpdated: new Date().toISOString()
      } : null)
    }, 10000)

    return () => clearInterval(interval)
  }, [bookingId])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Loading tracking info...</span>
        </div>
      </Card>
    )
  }

  if (!tracking) {
    return (
      <Card className="p-6">
        <p className="text-gray-600 text-center">Tracking not available</p>
      </Card>
    )
  }

  const statusConfig = {
    'on-way': {
      icon: '🚗',
      label: 'On the Way',
      color: 'bg-blue-100 text-blue-800',
      description: 'Your cleaner is heading to your location'
    },
    'arrived': {
      icon: '📍',
      label: 'Arrived',
      color: 'bg-green-100 text-green-800',
      description: 'Your cleaner has arrived'
    },
    'in-progress': {
      icon: '🧹',
      label: 'In Progress',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Your cleaner is working on the service'
    },
    confirmed: {
      icon: '✓',
      label: 'Confirmed',
      color: 'bg-green-100 text-green-800',
      description: 'Cleaner has confirmed the booking'
    },
    completed: {
      icon: '',
      label: 'Completed',
      color: 'bg-blue-100 text-blue-800',
      description: 'Service has been completed'
    },
  }
  const config = statusConfig[tracking.status] || statusConfig['confirmed']

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{config.icon}</div>
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color} mb-2`}>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
              {config.label}
            </div>
            <p className="text-gray-600 text-sm">{config.description}</p>
            
            {tracking.estimatedArrival && tracking.status === 'on-way' && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 font-medium">
                  ETA: {new Date(tracking.estimatedArrival).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Map Placeholder */}
      <Card className="p-4">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Simple map visualization */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="0" y1="50" x2="100" y2="50" stroke="gray" strokeWidth="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="gray" strokeWidth="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="gray" strokeWidth="0.3" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="gray" strokeWidth="0.3" />
                <line x1="25" y1="0" x2="25" y2="100" stroke="gray" strokeWidth="0.3" />
                <line x1="75" y1="0" x2="75" y2="100" stroke="gray" strokeWidth="0.3" />
              </svg>
            </div>
          </div>
          
          {/* Client Location Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-xs">📍</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium bg-white px-2 py-1 rounded shadow">Your Location</span>
              </div>
            </div>
          </div>

          {/* Cleaner Location Marker (if on way) */}
          {tracking.status === 'on-way' && (
            <div className="absolute top-1/4 left-1/4">
              <div className="relative animate-bounce">
                <div className="w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-xs">🚗</span>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-medium bg-white px-2 py-1 rounded shadow">Cleaner</span>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live Tracking</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Last updated: {new Date(tracking.lastUpdated).toLocaleTimeString()}
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm font-medium">Call</span>
        </button>
        
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">Message</span>
        </button>
      </div>
    </div>
  )
}
