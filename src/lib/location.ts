import type { Location } from './types'


const getCapacitor = async () => {
  try {
    const capacitorModule = await import('@capacitor/core')
    return capacitorModule.Capacitor
  } catch (err) {
    console.warn('Capacitor not available in this environment:', err)

    return {
      isNativePlatform: () => false,
    }
  }
}

const getGeolocation = async () => {
  try {
    const geolocationModule = await import('@capacitor/geolocation')
    return geolocationModule.Geolocation
  } catch (err) {
    console.warn('Geolocation not available in this environment:', err)
    return null
  }
}

export async function getCurrentLocation(): Promise<Location | null> {
  try {

    const Capacitor = await getCapacitor();
    if (Capacitor.isNativePlatform()) {
      try {
        const Geolocation = await getGeolocation();
        if (Geolocation) {
          await Geolocation.requestPermissions();
          const { coords } = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });

          const location: Location = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          try {
            const address = await reverseGeocode(location.latitude, location.longitude);
            location.address = address;
          } catch { }

          return location;
        }
      } catch (error) {
        console.warn('Error using Capacitor geolocation:', error);
      }
    }


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
          } catch { }

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
    const Capacitor = await getCapacitor();
    if (Capacitor.isNativePlatform()) {
      try {
        const Geolocation = await getGeolocation();
        if (Geolocation) {
          const status = await Geolocation.checkPermissions();
          const fine = (status as any)?.location || (status as any)?.coarseLocation;
          return String(fine || 'unknown');
        }
      } catch (error) {
        console.warn('Error checking geolocation permissions:', error);
        return 'unknown';
      }
    }
    return 'browser';
  } catch {
    return 'unknown';
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {


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

export async function watchLocation(callback: (location: Location) => void): Promise<{ remove: () => void } | null> {
  try {
    const Capacitor = await getCapacitor();
    if (Capacitor.isNativePlatform()) {
      const Geolocation = await getGeolocation();
      if (Geolocation) {
        const watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          async (position) => {
            if (position) {
              callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          }
        );
        return { remove: async () => await Geolocation.clearWatch({ id: watchId }) };
      }
    }

    if (!navigator.geolocation) return null;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return { remove: () => navigator.geolocation.clearWatch(watchId) };
  } catch (error) {
    console.warn('Error starting location watch:', error);
    return null;
  }
}
