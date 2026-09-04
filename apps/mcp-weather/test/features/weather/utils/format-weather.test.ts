import { describe, expect, it } from "vitest";

import type {
  ForecastItem,
  ForecastResponse,
  WeatherResponse,
} from "~/features/weather/types/weather";
import {
  formatForecastResponse,
  formatWeatherResponse,
  normalizeCityName,
} from "~/features/weather/utils/format-weather";

/**
 * The pure half of the weather slice — the part that decides what a model
 * actually reads. Covered here because it needs no key and no network, which is
 * also why the E2E only has to prove the protocol.
 */

function weatherFixture(
  overrides: Partial<WeatherResponse> = {},
): WeatherResponse {
  return {
    coord: { lon: 106.6, lat: 10.8 },
    weather: [
      { id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" },
    ],
    base: "stations",
    main: {
      temp: 31.2,
      feels_like: 37.4,
      temp_min: 31.2,
      temp_max: 31.2,
      pressure: 1008,
      humidity: 70,
    },
    // Metres — the contract reports kilometres, which is the conversion below.
    visibility: 10000,
    wind: { speed: 3.6, deg: 250 },
    clouds: { all: 40 },
    dt: 1_700_000_000,
    sys: {
      type: 1,
      id: 9314,
      country: "VN",
      sunrise: 1_699_999_000,
      sunset: 1_700_040_000,
    },
    timezone: 25_200,
    id: 1_566_083,
    name: "Ho Chi Minh City",
    cod: 200,
    ...overrides,
  };
}

function forecastItemFixture(
  overrides: Partial<ForecastItem> = {},
): ForecastItem {
  return {
    dt: 1_700_000_000,
    main: {
      temp: 29,
      feels_like: 33,
      temp_min: 28,
      temp_max: 30,
      pressure: 1009,
      humidity: 74,
      temp_kf: 0,
    },
    weather: [
      { id: 500, main: "Rain", description: "light rain", icon: "10d" },
    ],
    clouds: { all: 75 },
    wind: { speed: 2.4, deg: 180 },
    visibility: 8000,
    pop: 0.42,
    sys: { pod: "d" },
    dt_txt: "2026-09-04 12:00:00",
    ...overrides,
  };
}

function forecastFixture(items: ForecastItem[]): ForecastResponse {
  return {
    cod: "200",
    message: 0,
    cnt: items.length,
    list: items,
    city: {
      id: 1_566_083,
      name: "Ho Chi Minh City",
      coord: { lat: 10.8, lon: 106.6 },
      country: "VN",
      population: 8_000_000,
      timezone: 25_200,
      sunrise: 1_699_999_000,
      sunset: 1_700_040_000,
    },
  };
}

describe("normalizeCityName", () => {
  it("strips Vietnamese diacritics so the provider's ASCII index matches", () => {
    expect(normalizeCityName("Hồ Chí Minh")).toBe("Ho Chi Minh");
  });

  it("maps đ and Đ, which NFD leaves whole", () => {
    // The one pair that is a distinct letter rather than a base plus a combining
    // mark — so the combining-mark range never sees it.
    expect(normalizeCityName("Đà Nẵng")).toBe("Da Nang");
  });

  it("leaves a plain ASCII city untouched", () => {
    expect(normalizeCityName("London")).toBe("London");
  });
});

describe("formatWeatherResponse", () => {
  it("converts visibility from metres to kilometres", () => {
    const { output } = formatWeatherResponse(weatherFixture(), "metric");

    expect(output.visibility).toBe(10);
  });

  it("labels metric with °C and m/s", () => {
    const { text } = formatWeatherResponse(weatherFixture(), "metric");

    expect(text).toContain("Temperature: 31.2°C (feels like 37.4°C)");
    expect(text).toContain("Wind Speed: 3.6 m/s");
  });

  it("labels imperial with °F and mph", () => {
    const { text } = formatWeatherResponse(weatherFixture(), "imperial");

    expect(text).toContain("31.2°F");
    expect(text).toContain("Wind Speed: 3.6 mph");
  });

  it("labels standard with K and m/s, the units the provider actually returns", () => {
    // The app this replaced printed "mph" here, because it branched on `metric`
    // alone. OpenWeatherMap reports metres per second for both standard and
    // metric — a wrong unit on a number a model reads out is the kind of error
    // nobody sees until the answer is already wrong.
    const { text } = formatWeatherResponse(weatherFixture(), "standard");

    expect(text).toContain("Wind Speed: 3.6 m/s");
    expect(text).toContain("31.2K");
  });

  it("falls back to N/A when the provider sends no condition", () => {
    const { output } = formatWeatherResponse(
      weatherFixture({ weather: [] }),
      "metric",
    );

    expect(output.description).toBe("N/A");
  });
});

describe("formatForecastResponse", () => {
  it("maps every entry and converts its visibility", () => {
    const { output } = formatForecastResponse(
      forecastFixture([forecastItemFixture()]),
      "metric",
    );

    expect(output.city).toBe("Ho Chi Minh City");
    expect(output.forecast).toHaveLength(1);
    expect(output.forecast[0]).toMatchObject({
      dateTime: "2026-09-04 12:00:00",
      visibility: 8,
      description: "light rain",
    });
  });

  it("renders the probability of precipitation as a whole percentage", () => {
    const { text } = formatForecastResponse(
      forecastFixture([forecastItemFixture()]),
      "metric",
    );

    expect(text).toContain("POP: 42%");
  });

  it("breaks the list into days every eighth 3-hourly entry", () => {
    // Nine entries is one full day plus one, so exactly one blank line separates
    // them — this is what keeps five days readable instead of forty flat rows.
    const items = Array.from({ length: 9 }, (_, index) =>
      forecastItemFixture({
        dt_txt: `2026-09-0${1 + Math.floor(index / 8)} 00:00:00`,
      }),
    );

    const { text } = formatForecastResponse(forecastFixture(items), "metric");

    // The header ends with one blank line of its own; a day break adds a second.
    expect(text.match(/\n\n/g)).toHaveLength(2);
  });
});
