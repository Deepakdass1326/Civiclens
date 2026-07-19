import { useState, useCallback } from "react";

/**
 * Wraps the browser Geolocation API. Components never touch navigator.geolocation
 * directly — this hook is the single point of truth for location state.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [status, setStatus] = useState("idle"); // idle | loading | succeeded | failed
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("failed");
      setError("Geolocation is not supported by this browser");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("succeeded");
      },
      (err) => {
        setStatus("failed");
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coords, status, error, requestLocation };
}
