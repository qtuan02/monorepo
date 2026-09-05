import * as z from "zod";

/**
 * The OpenWeatherMap payloads this app reads, and the two shapes its MCP tools
 * hand back.
 *
 * They live in the slice rather than in `@monorepo/types` because no other
 * workspace speaks to OpenWeatherMap: a consumer reaches this app over the MCP
 * wire, where the contract is the JSON-RPC tool schema, not a TypeScript type
 * (see this app's README).
 *
 * The response types mirror the provider's own JSON — `snake_case` fields and
 * all — so a mismatch shows up here rather than three call sites later. The
 * `*Output` types are the MCP contract's half, and their field names are part of
 * that contract: renaming one breaks a client that has already shipped.
 */

/** Every unit system OpenWeatherMap accepts, and the MCP tools expose. */
export type WeatherUnits = "metric" | "imperial" | "standard";

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level?: number;
    grnd_level?: number;
    humidity: number;
    temp_kf: number;
  };
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number;
  sys: { pod: "d" | "n" };
  dt_txt: string;
  rain?: { "3h": number };
  snow?: { "3h": number };
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/**
 * The other half of the file: what the two weather tools **return**.
 *
 * These are zod schemas rather than interfaces because `registerTool` needs a
 * schema anyway — the MCP `outputSchema` is what a client reads out of
 * `tools/list`. Declaring the shape once and inferring the TypeScript type from
 * it is what stops the advertised schema and the object `format-weather.ts`
 * builds from drifting apart; two hand-written copies of fourteen field names
 * would each typecheck while disagreeing.
 *
 * **Every field name here is the wire contract**: renaming one breaks a client
 * that has already shipped.
 */

export const weatherOutputSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  description: z.string(),
  humidity: z.number(),
  pressure: z.number(),
  windSpeed: z.number(),
  /** Kilometres. OpenWeatherMap reports metres; the conversion is ours. */
  visibility: z.number(),
});

export type WeatherOutput = z.infer<typeof weatherOutputSchema>;

export const forecastEntrySchema = z.object({
  dateTime: z.string(),
  timestamp: z.number(),
  temperature: z.number(),
  feelsLike: z.number(),
  tempMin: z.number(),
  tempMax: z.number(),
  description: z.string(),
  humidity: z.number(),
  pressure: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  visibility: z.number(),
  /** Probability of precipitation, 0–1 as the provider sends it. */
  pop: z.number(),
  clouds: z.number(),
});

export const forecastOutputSchema = z.object({
  city: z.string(),
  country: z.string(),
  forecast: z.array(forecastEntrySchema),
});

export type ForecastOutput = z.infer<typeof forecastOutputSchema>;
