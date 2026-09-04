import type {
  ForecastResponse,
  WeatherResponse,
  WeatherUnits,
} from "~/features/weather/types/weather";
import { env } from "~/env";
import { normalizeCityName } from "~/features/weather/utils/format-weather";

/**
 * The two OpenWeatherMap reads behind the MCP tools.
 *
 * They do **not** go through `@monorepo/api`: that package owns the backend
 * `NEXT_PUBLIC_BASE_DOMAIN_API` points at, one `HttpClient` and one service
 * singleton per system, and it is shared by every app in the workspace.
 * OpenWeatherMap is a third-party API with its own origin, its own API key in
 * the querystring, and exactly one consumer — this slice — which is the one
 * carve-out that rule names (§ "The one exception"). The moment a second app
 * needs the same provider it moves into the package as a service class.
 */

const OPENWEATHERMAP_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * One request shape for both endpoints.
 *
 * The key is read here rather than passed in, and it is a **required** variable
 * in `~/env` — so a deployment missing it fails at build with the variable's
 * name, instead of answering every `get-weather` call with a 401 nobody sees
 * until a model asks for the weather.
 */
async function fetchOpenWeatherMap<TResponse>(
  endpoint: "weather" | "forecast",
  city: string,
  units: WeatherUnits,
): Promise<TResponse> {
  const url = new URL(`${OPENWEATHERMAP_BASE_URL}/${endpoint}`);
  url.searchParams.set("q", normalizeCityName(city));
  url.searchParams.set("appid", env.MCP_WEATHER_OPENWEATHERMAP_API_KEY);
  url.searchParams.set("units", units);

  // No caching: a tool call asks what the weather is *now*, and Next's fetch
  // cache under `cacheComponents` would otherwise be free to answer from an
  // earlier request.
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    // The body carries OpenWeatherMap's own message ("city not found",
    // "Invalid API key"), which is the half a caller can act on — so it is kept
    // rather than flattened into the status line.
    const errorText = await response.text();

    throw new Error(
      `OpenWeatherMap API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return (await response.json()) as TResponse;
}

/** Current conditions for a city. */
export function getCurrentWeather(
  city: string,
  units: WeatherUnits = "metric",
): Promise<WeatherResponse> {
  return fetchOpenWeatherMap<WeatherResponse>("weather", city, units);
}

/** The 5-day / 3-hour forecast for a city. */
export function getForecast(
  city: string,
  units: WeatherUnits = "metric",
): Promise<ForecastResponse> {
  return fetchOpenWeatherMap<ForecastResponse>("forecast", city, units);
}
