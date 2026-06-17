/**
 * @file weather.ts
 * @description OpenWeatherMap integration for Northern Pakistan safety & expedition planning.
 */

const API_KEY =
  process.env.OPENWEATHER_API_KEY ||
  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeedKmh: number;
  windGustKmh?: number;
  visibilityKm: number;
  pressure: number;
  clouds: number;
  rainMm1h: number;
  snowMm1h: number;
  fetchedAt: string;
  source: "openweather" | "estimated";
}

export interface ForecastSlot {
  time: string;
  temp: number;
  condition: string;
  description: string;
  windSpeedKmh: number;
  pop: number;
}

function isKeyInvalid() {
  return !API_KEY || API_KEY.startsWith("http") || API_KEY.includes("{");
}

function msToKmh(ms: number) {
  return Math.round(ms * 3.6);
}

function parseCurrentPayload(data: Record<string, unknown>, fallbackCity: string): WeatherData {
  const main = data.main as { temp: number; feels_like: number; humidity: number; pressure: number };
  const weather = (data.weather as { main: string; description: string; icon: string }[])[0];
  const wind = (data.wind as { speed: number; gust?: number }) || { speed: 0 };
  const rain = (data.rain as { "1h"?: number })?.["1h"] ?? 0;
  const snow = (data.snow as { "1h"?: number })?.["1h"] ?? 0;
  const visibilityM = (data.visibility as number) ?? 10000;

  return {
    temp: Math.round(main.temp),
    feelsLike: Math.round(main.feels_like),
    condition: weather.main,
    description: weather.description,
    icon: weather.icon,
    city: (data.name as string) || fallbackCity,
    humidity: main.humidity,
    windSpeedKmh: msToKmh(wind.speed),
    windGustKmh: wind.gust ? msToKmh(wind.gust) : undefined,
    visibilityKm: Math.round((visibilityM / 1000) * 10) / 10,
    pressure: main.pressure,
    clouds: (data.clouds as { all: number })?.all ?? 0,
    rainMm1h: rain,
    snowMm1h: snow,
    fetchedAt: new Date().toISOString(),
    source: "openweather",
  };
}

function estimateWeather(lat: number, lon: number, city: string): WeatherData {
  const month = new Date().getMonth();
  const isWinter = month >= 10 || month <= 2;
  const highAltitude = lat > 35.2;

  let temp = highAltitude ? (isWinter ? 2 : 16) : isWinter ? 10 : 24;
  if (lon > 75.5) temp -= 2;

  return {
    temp,
    feelsLike: temp - (highAltitude ? 4 : 1),
    condition: isWinter && highAltitude ? "Snow" : "Clouds",
    description: "estimated regional conditions (API unavailable)",
    icon: isWinter && highAltitude ? "13d" : "03d",
    city,
    humidity: highAltitude ? 42 : 55,
    windSpeedKmh: highAltitude ? 18 : 10,
    visibilityKm: 8,
    pressure: 1012,
    clouds: 45,
    rainMm1h: 0,
    snowMm1h: isWinter && highAltitude ? 1.2 : 0,
    fetchedAt: new Date().toISOString(),
    source: "estimated",
  };
}

export async function fetchWeather(lat: number, lon: number, city = "Northern Pakistan"): Promise<WeatherData> {
  if (isKeyInvalid()) {
    return estimateWeather(lat, lon, city);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.warn(`[WeatherAPI] current weather failed (${response.status})`);
      return estimateWeather(lat, lon, city);
    }

    const data = await response.json();
    return parseCurrentPayload(data, city);
  } catch (error) {
    console.error("[WeatherAPI] Network error", error);
    return estimateWeather(lat, lon, city);
  }
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastSlot[]> {
  if (isKeyInvalid()) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];

    const data = await response.json();
    const list = (data.list as Record<string, unknown>[]) ?? [];

    return list.slice(0, 8).map((slot) => {
      const main = slot.main as { temp: number };
      const weather = (slot.weather as { main: string; description: string }[])[0];
      const wind = slot.wind as { speed: number };
      return {
        time: slot.dt_txt as string,
        temp: Math.round(main.temp),
        condition: weather.main,
        description: weather.description,
        windSpeedKmh: msToKmh(wind.speed),
        pop: Math.round(((slot.pop as number) ?? 0) * 100),
      };
    });
  } catch {
    return [];
  }
}

/** @deprecated use windSpeedKmh on WeatherData */
export type LegacyWeatherData = WeatherData & { windSpeed?: number };
