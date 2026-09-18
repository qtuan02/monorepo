import type {
  ForecastOutput,
  ForecastResponse,
  WeatherOutput,
  WeatherResponse,
  WeatherUnits,
} from "~/features/weather/types/weather";

/**
 * The pure half of the weather slice: everything between "OpenWeatherMap
 * answered" and "the tool returns". No `fetch`, no `env` — which is what lets
 * `test/features/weather/utils/format-weather.test.ts` cover the unit maths and
 * the city normalisation against fixtures, with no network and no API key.
 */

/**
 * Strips Vietnamese diacritics so a city typed the way a Vietnamese speaker
 * writes it still matches OpenWeatherMap's index, which is ASCII.
 *
 * `đ`/`Đ` are handled separately: they are not a base letter plus a combining
 * mark, so NFD leaves them whole and the range below never sees them.
 */
export function normalizeCityName(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** The unit suffixes a reader sees. OpenWeatherMap always reports metres. */
function unitLabels(units: WeatherUnits): { temp: string; speed: string } {
  if (units === "metric") return { temp: "°C", speed: "m/s" };
  if (units === "imperial") return { temp: "°F", speed: "mph" };
  return { temp: "K", speed: "m/s" };
}

/**
 * The MCP tool answers twice over: `content` for a model to read, and
 * `structuredContent` for a client to parse. Both are built here from one
 * payload so the two can never disagree.
 */
export function formatWeatherResponse(
  weatherData: WeatherResponse,
  units: WeatherUnits,
): { text: string; output: WeatherOutput } {
  const output: WeatherOutput = {
    city: weatherData.name,
    country: weatherData.sys.country,
    temperature: weatherData.main.temp,
    feelsLike: weatherData.main.feels_like,
    description: weatherData.weather[0]?.description || "N/A",
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    windSpeed: weatherData.wind.speed,
    // Metres in the payload, kilometres in the contract.
    visibility: weatherData.visibility / 1000,
  };

  const label = unitLabels(units);

  const text = `Weather in ${output.city}, ${output.country}:
Temperature: ${output.temperature}${label.temp} (feels like ${output.feelsLike}${label.temp})
Condition: ${output.description}
Humidity: ${output.humidity}%
Pressure: ${output.pressure} hPa
Wind Speed: ${output.windSpeed} ${label.speed}
Visibility: ${output.visibility} km`;

  return { text, output };
}

export function formatForecastResponse(
  forecastData: ForecastResponse,
  units: WeatherUnits,
): { text: string; output: ForecastOutput } {
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
      visibility: item.visibility / 1000,
      pop: item.pop,
      clouds: item.clouds.all,
    })),
  };

  const label = unitLabels(units);

  // OpenWeatherMap returns 3-hourly entries, so eight of them are one day — the
  // blank line every eighth row is what makes five days readable in a model's
  // context window rather than one wall of forty lines.
  const rows = output.forecast.map((item, index) => {
    const dayBreak = index > 0 && index % 8 === 0 ? "\n" : "";
    const pop = `${(item.pop * 100).toFixed(0)}%`;

    return `${dayBreak}${item.dateTime}: ${item.temperature}${label.temp} (feels like ${item.feelsLike}${label.temp}), ${item.description}, Wind: ${item.windSpeed} ${label.speed}, Humidity: ${item.humidity}%, POP: ${pop}\n`;
  });

  const text = `Weather Forecast for ${output.city}, ${output.country}:\n\n${rows.join("")}`;

  return { text, output };
}
