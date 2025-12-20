import { Card } from './ui'

interface LocationMapProps {
  location: {
    address?: string
    manualAddress?: string
    coordinates?: [number, number] // [longitude, latitude]
  }
  title?: string
}

export default function LocationMap({ location, title = "Client Location" }: LocationMapProps) {
  // Get the best available address
  const displayAddress = location.manualAddress || location.address || "Unknown location"
  
  // For now, we'll create a simple visual representation of a map
  // In a real implementation, this would integrate with Google Maps or Leaflet
  
  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{displayAddress}</p>
      </div>
      
      {/* Simple map visualization */}
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
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
        
        {/* Location Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs">📍</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium bg-white px-2 py-1 rounded shadow">Client</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Location Map</span>
          </div>
        </div>
      </div>
      
      {location.coordinates && (
        <p className="text-xs text-gray-500 mt-2">
          Coordinates: {location.coordinates[1]}, {location.coordinates[0]}
        </p>
      )}
    </Card>
  )
}