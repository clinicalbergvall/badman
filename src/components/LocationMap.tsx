import { Card } from './ui'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for default marker icon in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Component to recenter map when coordinates change
function RecenterMap({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap()
  map.setView([lat, lng])
  return null
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  })
  return null;
}

interface LocationMapProps {
  location: {
    address?: string
    manualAddress?: string
    coordinates?: [number, number]
  }
  title?: string
  height?: string
  draggable?: boolean
  onLocationChange?: (lat: number, lng: number) => void
}

export default function LocationMap({
  location,
  title = "Client Location",
  height = "300px",
  draggable = false,
  onLocationChange
}: LocationMapProps) {

  const displayAddress = location.manualAddress || location.address || "Unknown location"

  // Default to Nairobi center if no coordinates (approximate)
  const defaultCenter: [number, number] = [-1.2921, 36.8219]

  // Validate coordinates before using them
  const position: [number, number] = location.coordinates && 
    Array.isArray(location.coordinates) && 
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number' &&
    !isNaN(location.coordinates[0]) &&
    !isNaN(location.coordinates[1]) &&
    isFinite(location.coordinates[0]) &&
    isFinite(location.coordinates[1])
    ? [location.coordinates[0], location.coordinates[1]]
    : defaultCenter

  const eventHandlers = {
    dragend(e: any) {
      if (onLocationChange) {
        const marker = e.target
        const position = marker.getLatLng()
        onLocationChange(position.lat, position.lng)
      }
    },
  }

  // Check if coordinates are valid before rendering
  const hasValidCoordinates = location.coordinates &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number' &&
    !isNaN(location.coordinates[0]) &&
    !isNaN(location.coordinates[1]) &&
    isFinite(location.coordinates[0]) &&
    isFinite(location.coordinates[1]);

  if (!hasValidCoordinates && !location.manualAddress && !location.address) {
    return (
      <Card className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">No location data available</p>
        </div>
        <div className="rounded-lg overflow-hidden bg-gray-100 z-0 relative" style={{ height: height }}>
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
            <p>No location to display</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{displayAddress}</p>
        {draggable && (
          <p className="text-xs text-blue-600 font-medium mt-1 animate-pulse">
            💡 Tip: Drag the marker to pinpoint your exact location
          </p>
        )}
      </div>

      <div
        className="rounded-lg overflow-hidden bg-gray-100 z-0 relative"
        style={{ height: height }}
      >
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            draggable={draggable}
            {...(draggable && onLocationChange ? { eventHandlers } : {})}
          >
            <Popup>
              {displayAddress}
            </Popup>
          </Marker>
          {(draggable && onLocationChange) ? (
            <MapClickHandler onClick={onLocationChange} />
          ) : null}
          <RecenterMap lat={position[0]} lng={position[1]} />
        </MapContainer>
      </div>

      {hasValidCoordinates && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {location.coordinates![0].toFixed(6)}, {location.coordinates![1].toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates![0]},${location.coordinates![1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>🧭</span> Get Directions
          </a>
        </div>
      )}
    </Card>
  )
}