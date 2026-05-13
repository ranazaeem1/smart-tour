/**
 * @file weather.ts
 * @description Utility for fetching weather data from OpenWeatherMap API.
 * Uses the JSON structure: { coord: { lon, lat }, weather: [{ main, description, icon }], main: { temp, humidity }, wind: { speed }, name }
 */

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mock data fallback for common Pakistan northern areas
const MOCK_WEATHER: Record<string, any> = {
  "Hunza": { temp: 18, condition: "Clear", description: "sunny with light breeze", icon: "01d", city: "Hunza Valley" },
  "Skardu": { temp: 15, condition: "Clouds", description: "partly cloudy", icon: "02d", city: "Skardu" },
  "Swat": { temp: 22, condition: "Sunny", description: "clear skies", icon: "01d", city: "Swat Valley" },
  "Murree": { temp: 16, condition: "Rain", description: "light rain", icon: "10d", city: "Murree" },
  "Default": { temp: 20, condition: "Clear", description: "clear sky", icon: "01d", city: "Northern Pakistan" }
};

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Fetches current weather for a specific latitude and longitude.
 * Falls back to mock data if API key is invalid or missing.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const isKeyInvalid = !API_KEY || API_KEY.startsWith('http') || API_KEY.includes('{');

  if (isKeyInvalid) {
    return getMockWeather(lat, lon);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("[WeatherAPI] 401 Unauthorized: Falling back to mock data. Please provide a valid NEXT_PUBLIC_OPENWEATHER_API_KEY.");
        return getMockWeather(lat, lon);
      }
      
      const status = response.status;
      let errMsg = "Unknown error";
      try {
        const errData = await response.json();
        errMsg = errData.message || JSON.stringify(errData);
      } catch (e) {
        errMsg = response.statusText;
      }
      
      console.error(`[WeatherAPI] Fetch failed (${status}): ${errMsg}`);
      return null;
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  } catch (error) {
    console.error("[WeatherAPI] Network/Parsing Error. Falling back to mock data.", error);
    return getMockWeather(lat, lon);
  }
}

function getMockWeather(lat: number, lon: number): WeatherData {
  // Simple heuristic for Pakistan Northern Areas
  let mock = MOCK_WEATHER.Default;
  
  if (lat > 35 && lon > 74) mock = MOCK_WEATHER.Hunza;
  else if (lat > 35 && lon > 75) mock = MOCK_WEATHER.Skardu;
  else if (lat > 34 && lon > 72) mock = MOCK_WEATHER.Swat;
  else if (lat > 33 && lon > 73) mock = MOCK_WEATHER.Murree;

  return {
    ...mock,
    humidity: 45,
    windSpeed: 12
  };
}
