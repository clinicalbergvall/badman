import type { Location } from './types'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

export async function getCurrentLocation(): Promise<Location | null> {
  try {
    // Prefer Capacitor native geolocation on device
    if (Capacitor.isNativePlatform()) {
      try {
        await Geolocation.requestPermissions()
      } catch {}

      const { coords } = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      })

      const location: Location = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }

      try {
        const address = await reverseGeocode(location.latitude, location.longitude)
        location.address = address
      } catch {}

      return location
    }

    // Fallback to browser geolocation
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }

          try {
            const address = await reverseGeocode(location.latitude, location.longitude)
            location.address = address
          } catch {}

          resolve(location)
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  } catch {
    return null
  }
}

export async function getLocationPermissionStatus(): Promise<string> {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await Geolocation.checkPermissions()
      const fine = (status as any)?.location || (status as any)?.coarseLocation
      return String(fine || 'unknown')
    }
    return 'browser'
  } catch {
    return 'unknown'
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Using OpenStreetMap Nominatim API (free, no API key required)
  // For production, consider using Google Maps Geocoding API
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CleanCloakApp/1.0'
        }
      }
    )
    const data = await response.json()
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

export function formatLocation(location: Location): string {
  if (location.manualAddress) {
    return location.manualAddress
  }
  if (location.address) {
    return location.address
  }
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
}
