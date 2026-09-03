import type {
  ForecastOutput,
  ForecastResponse,
  WeatherOutput,
  WeatherResponse,
} from "~/types/weather";
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

/**
 * Get weather forecast data from OpenWeatherMap API
 * @param city - City name (e.g., "Ho Chi Minh City", "London", "New York")
 * @param units - Units of measurement: "metric" (Celsius), "imperial" (Fahrenheit), or "standard" (Kelvin)
 * @returns ForecastResponse from OpenWeatherMap API
 * @throws Error if API key is missing or API call fails
 */
export async function getForecast(
  city: string,
  units: "metric" | "imperial" | "standard" = "metric",
): Promise<ForecastResponse> {
  const apiKey = env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHERMAP_API_KEY is not configured");
  }

  // Normalize city name (remove diacritics and map to English names)
  const normalizedCity = removeVietnameseDiacritics(city);

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
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

  return response.json() as Promise<ForecastResponse>;
}

/**
 * Format forecast response into structured output and human-readable text
 * @param forecastData - ForecastResponse from OpenWeatherMap API
 * @param units - Units of measurement used
 * @returns Object with formatted text and structured output
 */
export function formatForecastResponse(
  forecastData: ForecastResponse,
  units: "metric" | "imperial" | "standard",
): {
  text: string;
  output: ForecastOutput;
} {
  const output: ForecastOutput = {
    city: forecastData.city.name,
    country: forecastData.city.country,
    forecast: forecastData.list.map((item) => ({
      dateTime: item.dt_txt,
      timestamp: item.dt,
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      tempMin: item.main.temp_min,
      tempMax: item.main.temp_max,
      description: item.weather[0]?.description || "N/A",
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      visibility: item.visibility / 1000, // Convert meters to kilometers
      pop: item.pop,
      clouds: item.clouds.all,
    })),
  };

  // Format units for display
  const tempUnit =
    units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  // Create human-readable text response
  let text = `Weather Forecast for ${output.city}, ${output.country}:\n\n`;

  output.forecast.forEach((item, index) => {
    if (index > 0 && index % 8 === 0) {
      text += "\n";
    }
    text += `${item.dateTime}: ${item.temperature}${tempUnit} (feels like ${item.feelsLike}${tempUnit}), ${item.description}, Wind: ${item.windSpeed} ${speedUnit}, Humidity: ${item.humidity}%, POP: ${(item.pop * 100).toFixed(0)}%\n`;
  });

  return { text, output };
}
