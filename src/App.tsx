import Booking from './pages/BookingEnhanced'
import { Badge } from '@/components/ui'
import React from 'react';
const { useEffect, useState } = React;

export default function App() {
  const [performanceMode, setPerformanceMode] = useState(false)

  useEffect(() => {
    const savedPerf = localStorage.getItem('performanceMode')
    setPerformanceMode(savedPerf === 'true')
  }, [])
  return (
    <div className="container relative">
      {}
      {!performanceMode && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      )}

      <div className={performanceMode ? "hero card" : "hero glass"}>
        <div className="hero-inner flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-yellow-100 text-xs font-semibold text-black border border-yellow-300">
              <Badge variant="warning" className="mb-3">
                <span className={performanceMode ? "" : "animate-pulse"}></span>
                <span>On-Demand Services</span>
              </Badge>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-black mb-2">
              CleanCloak
            </h1>
            <p className="text-gray-700 text-base sm:text-lg mb-4">
              Professional car detailing services
            </p>
          </div>
        </div>
      </div>
      <div className={performanceMode ? "card p-4" : "card p-4 glass"}>
        <Booking />
      </div>
    </div>
  )
}
