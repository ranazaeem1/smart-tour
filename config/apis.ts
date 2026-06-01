export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
export const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";

export const API_ENDPOINTS = {
  mapboxGeocoding: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  mapboxDirections: "https://api.mapbox.com/directions/v5/mapbox/driving",
  openWeatherCurrent: "https://api.openweathermap.org/data/2.5/weather",
  mapboxLightStyle: "mapbox://styles/mapbox/light-v11",
} as const;

export const WEATHER_REFRESH_MS = 10 * 60 * 1000;
export const LOCATION_REFRESH_MS = 5000;
