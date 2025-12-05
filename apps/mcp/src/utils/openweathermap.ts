import type { WeatherOutput, WeatherResponse } from "~/types/weather";
import { env } from "../../env";

/**
 * Remove Vietnamese diacritics (dấu) from text
 * @param text - Text with Vietnamese diacritics
 * @returns Text without diacritics
 */
function removeVietnameseDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Get current weather data from OpenWeatherMap API
 * @param city - City name (e.g., "Ho Chi Minh City", "London", "New York")
 * @param units - Units of measurement: "metric" (Celsius), "imperial" (Fahrenheit), or "standard" (Kelvin)
 * @returns WeatherResponse from OpenWeatherMap API
 * @throws Error if API key is missing or API call fails
 */
export async function getCurrentWeather(
  city: string,
  units: "metric" | "imperial" | "standard" = "metric",
): Promise<WeatherResponse> {
  const apiKey = env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHERMAP_API_KEY is not configured");
  }

  // Normalize city name (remove diacritics and map to English names)
  const normalizedCity = removeVietnameseDiacritics(city);

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", normalizedCity);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", units);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenWeatherMap API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json() as Promise<WeatherResponse>;
}

/**
 * Format weather response into structured output and human-readable text
 * @param weatherData - WeatherResponse from OpenWeatherMap API
 * @param units - Units of measurement used
 * @returns Object with formatted text and structured output
 */
export function formatWeatherResponse(
  weatherData: WeatherResponse,
  units: "metric" | "imperial" | "standard",
): {
  text: string;
  output: WeatherOutput;
} {
  const output: WeatherOutput = {
    city: weatherData.name,
    country: weatherData.sys.country,
    temperature: weatherData.main.temp,
    feelsLike: weatherData.main.feels_like,
    description: weatherData.weather[0]?.description || "N/A",
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    windSpeed: weatherData.wind.speed,
    visibility: weatherData.visibility / 1000, // Convert meters to kilometers
  };

  // Format units for display
  const tempUnit =
    units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  // Create human-readable text response
  const text = `Weather in ${output.city}, ${output.country}:
Temperature: ${output.temperature}${tempUnit} (feels like ${output.feelsLike}${tempUnit})
Condition: ${output.description}
Humidity: ${output.humidity}%
Pressure: ${output.pressure} hPa
Wind Speed: ${output.windSpeed} ${speedUnit}
Visibility: ${output.visibility} km`;

  return { text, output };
}
