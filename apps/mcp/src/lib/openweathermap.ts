import type {
  CurrentWeatherOutput,
  CurrentWeatherResponse,
  ForecastItemOutput,
  ForecastOutput,
  ForecastResponse,
  WeatherError,
  WeatherUnits,
} from "../types/weather";
// import { env } from "../../env";

const API_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Get current weather data for a city
 * Based on OpenWeatherMap Current Weather Data API
 * @param city - City name (e.g., "London", "New York", "Hồ Chí Minh")
 * @param units - Units of measurement: "metric" (Celsius), "imperial" (Fahrenheit), or "standard" (Kelvin)
 * @param lang - Language code for weather descriptions (e.g., "vi", "en")
 * @returns Current weather data from OpenWeatherMap API
 * @throws Error if API key is missing, city is empty, or API request fails
 */
export async function getCurrentWeather(
  city: string,
  units: WeatherUnits = "metric",
  lang?: string,
): Promise<CurrentWeatherResponse> {
  // if (!"3c45739a51e8b9e7363c87f90dc81be7") {
  //   throw new Error(
  //     "OPENWEATHERMAP_API_KEY is not configured. Please set it in your .env file.",
  //   );
  // }

  if (!city || city.trim().length === 0) {
    throw new Error("City name cannot be empty");
  }

  const url = new URL(`${API_BASE_URL}/weather`);
  // URL encode city name to handle special characters and non-ASCII characters
  url.searchParams.set("q", city.trim());
  url.searchParams.set("appid", "3c45739a51e8b9e7363c87f90dc81be7");
  url.searchParams.set("units", units);
  // Add language parameter if provided (e.g., "vi" for Vietnamese, "en" for English)
  if (lang) {
    url.searchParams.set("lang", lang);
  }

  console.log("[OpenWeatherMap] Fetching current weather for city:", city);
  console.log(
    "[OpenWeatherMap] URL:",
    url.toString().replace("3c45739a51e8b9e7363c87f90dc81be7", "***"),
  );

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error: WeatherError = await response.json();
        errorMessage = error.message || errorMessage;
        console.error("[OpenWeatherMap] API error:", error);
      } catch {
        // If response is not JSON, use status text
        const text = await response.text().catch(() => "");
        console.error("[OpenWeatherMap] API error (non-JSON):", text);
        errorMessage = text || errorMessage;
      }
      throw new Error(`OpenWeatherMap API error: ${errorMessage}`);
    }

    const data: CurrentWeatherResponse = await response.json();
    console.log(
      "[OpenWeatherMap] Successfully fetched weather data for:",
      data.name,
    );
    console.log(
      "[OpenWeatherMap] Temperature:",
      data.main.temp,
      units === "metric" ? "°C" : "°F",
    );
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OpenWeatherMap API request timed out");
    }
    throw error;
  }
}

/**
 * Transform OpenWeatherMap current weather response to MCP tool output format
 */
export function transformCurrentWeather(
  data: CurrentWeatherResponse,
): CurrentWeatherOutput {
  return {
    city: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind?.speed ?? 0,
    windDirection: data.wind?.deg ?? 0,
    description: data.weather[0]?.description || "N/A",
    main: data.weather[0]?.main || "N/A",
    visibility: data.visibility ?? 0,
    clouds: data.clouds?.all ?? 0,
  };
}

/**
 * Get 5-day weather forecast for a city
 * Based on OpenWeatherMap 5 Day / 3 Hour Forecast API
 * @param city - City name (e.g., "London", "New York", "Hồ Chí Minh")
 * @param units - Units of measurement: "metric" (Celsius), "imperial" (Fahrenheit), or "standard" (Kelvin)
 * @param lang - Language code for weather descriptions (e.g., "vi", "en")
 * @returns 5-day weather forecast data from OpenWeatherMap API
 * @throws Error if API key is missing, city is empty, or API request fails
 */
export async function getForecast(
  city: string,
  units: WeatherUnits = "metric",
  lang?: string,
): Promise<ForecastResponse> {
  // First, get coordinates from city name using current weather API
  const currentWeather = await getCurrentWeather(city, units, lang);
  const { lat, lon } = currentWeather.coord;

  // if (!"3c45739a51e8b9e7363c87f90dc81be7") {
  //   throw new Error("OPENWEATHERMAP_API_KEY is not configured");
  // }

  // Then get forecast using coordinates (more reliable than city name)
  const url = new URL(`${API_BASE_URL}/forecast`);
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());
  url.searchParams.set("appid", "3c45739a51e8b9e7363c87f90dc81be7");
  url.searchParams.set("units", units);
  // Add language parameter if provided
  if (lang) {
    url.searchParams.set("lang", lang);
  }

  console.log(
    "[OpenWeatherMap] Fetching forecast for city:",
    city,
    `(${lat}, ${lon})`,
  );
  console.log(
    "[OpenWeatherMap] Forecast URL:",
    url.toString().replace("3c45739a51e8b9e7363c87f90dc81be7", "***"),
  );

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error: WeatherError = await response.json();
        errorMessage = error.message || errorMessage;
        console.error("[OpenWeatherMap] Forecast API error:", error);
      } catch {
        // If response is not JSON, use status text
        const text = await response.text().catch(() => "");
        console.error("[OpenWeatherMap] Forecast API error (non-JSON):", text);
        errorMessage = text || errorMessage;
      }
      throw new Error(`OpenWeatherMap API error: ${errorMessage}`);
    }

    const data: ForecastResponse = await response.json();
    console.log(
      "[OpenWeatherMap] Successfully fetched forecast for:",
      data.city.name,
    );
    console.log("[OpenWeatherMap] Forecast items count:", data.list.length);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OpenWeatherMap API request timed out");
    }
    throw error;
  }
}

/**
 * Transform OpenWeatherMap forecast response to MCP tool output format
 */
export function transformForecast(data: ForecastResponse): ForecastOutput {
  const forecast: ForecastItemOutput[] = data.list.map((item) => ({
    date: item.dt_txt,
    temperature: item.main.temp,
    feelsLike: item.main.feels_like,
    tempMin: item.main.temp_min,
    tempMax: item.main.temp_max,
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    windSpeed: item.wind?.speed ?? 0,
    windDirection: item.wind?.deg ?? 0,
    description: item.weather[0]?.description || "N/A",
    main: item.weather[0]?.main || "N/A",
    clouds: item.clouds?.all ?? 0,
    pop: item.pop ?? 0,
  }));

  return {
    city: data.city.name,
    country: data.city.country,
    forecast,
  };
}
