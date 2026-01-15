interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, showLabel, className = '' }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={`w-full ${className}`}>
      <div className="h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner border border-gray-200">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full transition-all duration-700 ease-out shadow-md hover:shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-600 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
