"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LiveLocation = {
  lat: number;
  lng: number;
  accuracy: number | null;
  updatedAt: string;
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 5000,
};

function geolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Location permission was denied. Enable location access to show your route.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Your current location is unavailable right now.";
  if (error.code === error.TIMEOUT) return "Location request timed out. Try refreshing in a moment.";
  return error.message || "Unable to read your current location.";
}

function toLiveLocation(position: GeolocationPosition): LiveLocation {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: Math.round(position.coords.accuracy),
    updatedAt: new Date().toISOString(),
  };
}

export function useLiveLocation() {
  const watchIdRef = useRef<number | null>(null);
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    () =>
      new Promise<LiveLocation>((resolve, reject) => {
        if (!navigator.geolocation) {
          const message = "Geolocation is not supported by this browser.";
          setError(message);
          setLoading(false);
          reject(new Error(message));
          return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const nextLocation = toLiveLocation(position);
            setLocation(nextLocation);
            setError(null);
            setLoading(false);
            resolve(nextLocation);
          },
          (geoError) => {
            const message = geolocationErrorMessage(geoError);
            setError(message);
            setLoading(false);
            reject(new Error(message));
          },
          GEO_OPTIONS
        );
      }),
    []
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    void refresh().catch(() => undefined);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(toLiveLocation(position));
        setError(null);
        setLoading(false);
      },
      (geoError) => {
        setError(geolocationErrorMessage(geoError));
        setLoading(false);
      },
      GEO_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [refresh]);

  return { location, loading, error, refresh };
}
