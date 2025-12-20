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
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-600 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
