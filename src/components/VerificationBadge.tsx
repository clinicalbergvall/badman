import type { VerificationDetails } from '@/lib/types'

interface VerificationBadgeProps {
  verification?: VerificationDetails
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

export default function VerificationBadge({ 
  verification, 
  size = 'md',
  showDetails = false 
}: VerificationBadgeProps) {
  if (!verification) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
        <span>⚠️</span>
        <span>Not Verified</span>
      </div>
    )
  }

  const verificationScore = [
    verification.idVerified,
    verification.policeCheck,
    verification.references.length > 0
  ].filter(Boolean).length

  const isFullyVerified = verificationScore === 3

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <div className="space-y-2">
      {}
      <div className={`inline-flex items-center gap-1.5 ${
        isFullyVerified 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      } rounded-full font-medium ${sizeClasses[size]}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>
          {isFullyVerified ? 'Fully Verified' : `${verificationScore}/3 Verified`}
        </span>
      </div>

      {}
      {showDetails && (
        <div className="space-y-1.5 text-sm">
          <VerificationItem 
            label="ID Verified" 
            verified={verification.idVerified} 
          />
          <VerificationItem 
            label="Police Clearance" 
            verified={verification.policeCheck} 
          />
          <VerificationItem 
            label="References" 
            verified={verification.references.length > 0}
            detail={`${verification.references.length} reference${verification.references.length !== 1 ? 's' : ''}`}
          />
        </div>
      )}
    </div>
  )
}

function VerificationItem({ 
  label, 
  verified, 
  detail 
}: { 
  label: string
  verified: boolean
  detail?: string
}) {
  return (
    <div className="flex items-center gap-2">
      {verified ? (
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={verified ? 'text-gray-900' : 'text-gray-500'}>
        {label}
        {detail && <span className="text-gray-600 ml-1">({detail})</span>}
      </span>
    </div>
  )
}
