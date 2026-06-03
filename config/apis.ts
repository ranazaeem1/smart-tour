export const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";

export const API_ENDPOINTS = {
  openWeatherCurrent: "https://api.openweathermap.org/data/2.5/weather",
} as const;

export const WEATHER_REFRESH_MS = 10 * 60 * 1000;
export const LOCATION_REFRESH_MS = 5000;
