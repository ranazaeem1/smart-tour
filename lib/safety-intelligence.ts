import type { NorthernDestination } from "./northern-pakistan-destinations";
import { fetchForecast, fetchWeather, type ForecastSlot, type WeatherData } from "./weather";

export interface SafetyAlertItem {
  id: string;
  area: string;
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface SafetyZoneSnapshot {
  area: string;
  score: number;
  status: string;
  color: string;
  description: string;
  latitude: number;
  longitude: number;
  region: string;
}

export interface DestinationSafetyIntel {
  destination: NorthernDestination;
  weather: WeatherData;
  forecast: ForecastSlot[];
  score: number;
  status: string;
  color: string;
  alerts: SafetyAlertItem[];
  factors: { label: string; detail: string; severity: "low" | "medium" | "high" }[];
  lastUpdated: string;
  dataSourceLabel: string;
}

function scoreColor(score: number) {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#F59E0B";
  return "#EF4444";
}

function scoreStatus(score: number) {
  if (score >= 90) return "Very Safe";
  if (score >= 80) return "Safe";
  if (score >= 65) return "Moderate";
  if (score >= 50) return "Caution";
  return "High Risk";
}

export function buildSafetyIntel(
  destination: NorthernDestination,
  weather: WeatherData,
  forecast: ForecastSlot[]
): DestinationSafetyIntel {
  let score = 100;
  const alerts: SafetyAlertItem[] = [];
  const factors: DestinationSafetyIntel["factors"] = [];

  const condition = weather.condition.toLowerCase();
  const desc = weather.description.toLowerCase();

  if (condition.includes("thunder")) {
    score -= 35;
    alerts.push({
      id: "wx-thunder",
      area: destination.name,
      type: "Thunderstorm Alert",
      severity: "high",
      description: `Live weather reports thunderstorms near ${destination.name}. Avoid exposed ridges and river crossings until conditions improve.`,
    });
    factors.push({ label: "Thunderstorm activity", detail: "Active storm cells in the area", severity: "high" });
  }

  if (condition.includes("snow") || weather.snowMm1h > 0.5) {
    score -= weather.snowMm1h > 2 ? 22 : 12;
    alerts.push({
      id: "wx-snow",
      area: destination.name,
      type: "Snow / Ice",
      severity: weather.snowMm1h > 2 ? "high" : "medium",
      description: `Snow conditions detected (${weather.snowMm1h} mm/h). Mountain passes may be slippery above ${destination.elevationM}m.`,
    });
    factors.push({ label: "Snowfall", detail: `${weather.snowMm1h} mm in the last hour`, severity: "medium" });
  }

  if (condition.includes("rain") || weather.rainMm1h > 0.3 || desc.includes("rain")) {
    score -= weather.rainMm1h > 4 ? 25 : 14;
    alerts.push({
      id: "wx-rain",
      area: destination.name,
      type: "Rain & Landslide Risk",
      severity: weather.rainMm1h > 4 ? "high" : "medium",
      description: `Rainfall at ${weather.rainMm1h} mm/h increases landslide and flash-flood risk on valley roads.`,
    });
    factors.push({ label: "Rainfall", detail: `${weather.rainMm1h} mm/h — monitor road closures`, severity: "medium" });
  }

  if (weather.windSpeedKmh >= 55 || (weather.windGustKmh && weather.windGustKmh >= 70)) {
    score -= 22;
    alerts.push({
      id: "wx-wind-high",
      area: destination.name,
      type: "High Wind",
      severity: "high",
      description: `Sustained winds ${weather.windSpeedKmh} km/h${weather.windGustKmh ? `, gusts to ${weather.windGustKmh} km/h` : ""}. High bridges and ridgelines are unsafe.`,
    });
    factors.push({ label: "High winds", detail: `${weather.windSpeedKmh} km/h sustained`, severity: "high" });
  } else if (weather.windSpeedKmh >= 35) {
    score -= 10;
    factors.push({ label: "Wind exposure", detail: `${weather.windSpeedKmh} km/h — secure campsites`, severity: "medium" });
  }

  if (weather.temp <= -10) {
    score -= 18;
    alerts.push({
      id: "wx-cold-extreme",
      area: destination.name,
      type: "Extreme Cold",
      severity: "high",
      description: `Air temperature ${weather.temp}°C (feels like ${weather.feelsLike}°C). Hypothermia risk without proper alpine gear.`,
    });
  } else if (weather.temp <= 0) {
    score -= 10;
    factors.push({ label: "Freezing temperatures", detail: `${weather.temp}°C at destination`, severity: "medium" });
  }

  if (destination.elevationM >= 3000 && weather.temp <= 5) {
    score -= 6;
    factors.push({
      label: "High altitude",
      detail: `${destination.elevationM}m elevation — acclimatize and watch for altitude sickness`,
      severity: "medium",
    });
  }

  if (weather.visibilityKm < 2) {
    score -= 16;
    alerts.push({
      id: "wx-visibility",
      area: destination.name,
      type: "Low Visibility",
      severity: "medium",
      description: `Visibility about ${weather.visibilityKm} km. Delay travel on passes (Babusar, Khunjerab, Deosai) until it clears.`,
    });
  } else if (weather.visibilityKm < 5) {
    score -= 8;
  }

  if (weather.clouds >= 85 && !condition.includes("clear")) {
    score -= 4;
    factors.push({ label: "Heavy cloud cover", detail: `${weather.clouds}% cloud — limited mountain views`, severity: "low" });
  }

  const heavyRainAhead = forecast.some((f) => f.pop >= 70 && f.condition.toLowerCase().includes("rain"));
  const stormAhead = forecast.some((f) => f.condition.toLowerCase().includes("thunder"));

  if (stormAhead) {
    score -= 8;
    alerts.push({
      id: "wx-forecast-storm",
      area: destination.name,
      type: "Forecast: Storms",
      severity: "medium",
      description: "Storm probability in the next 24 hours. Plan indoor buffer time and flexible departure windows.",
    });
  }

  if (heavyRainAhead) {
    score -= 6;
    alerts.push({
      id: "wx-forecast-rain",
      area: destination.name,
      type: "Forecast: Heavy Rain",
      severity: "medium",
      description: "Heavy precipitation likely in upcoming hours. Check NDMA / local admin road advisories before driving.",
    });
  }

  score = Math.max(20, Math.min(100, score));

  if (alerts.length === 0 && score >= 80) {
    factors.push({
      label: "Stable conditions",
      detail: `${weather.description} — suitable for trekking with standard precautions`,
      severity: "low",
    });
  }

  if (weather.source === "estimated") {
    alerts.unshift({
      id: "data-estimated",
      area: destination.name,
      type: "Data Notice",
      severity: "low",
      description:
        "Live OpenWeather data is unavailable. Scores use regional estimates — verify conditions locally before travel.",
    });
  }

  const status = scoreStatus(score);
  const color = scoreColor(score);

  return {
    destination,
    weather,
    forecast,
    score,
    status,
    color,
    alerts,
    factors,
    lastUpdated: weather.fetchedAt,
    dataSourceLabel:
      weather.source === "openweather"
        ? "OpenWeatherMap · live"
        : "Regional estimate · configure OPENWEATHER_API_KEY for live data",
  };
}

export async function fetchDestinationSafetyIntel(
  destination: NorthernDestination
): Promise<DestinationSafetyIntel> {
  const [weather, forecast] = await Promise.all([
    fetchWeather(destination.lat, destination.lon, destination.name),
    fetchForecast(destination.lat, destination.lon),
  ]);
  return buildSafetyIntel(destination, weather, forecast);
}

export function toSafetyZoneSnapshot(intel: DestinationSafetyIntel): SafetyZoneSnapshot {
  return {
    area: intel.destination.name,
    score: intel.score,
    status: intel.status,
    color: intel.color,
    description: `${intel.weather.description} · ${intel.weather.temp}°C · wind ${intel.weather.windSpeedKmh} km/h`,
    latitude: intel.destination.lat,
    longitude: intel.destination.lon,
    region: intel.destination.region,
  };
}
