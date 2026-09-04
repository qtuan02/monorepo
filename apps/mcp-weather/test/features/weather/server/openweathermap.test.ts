// @vitest-environment node
//
// The rest of this app's suite runs on jsdom, where t3-env treats the process as
// a browser and refuses to hand out a `server` variable. This file is the one
// that reads `MCP_WEATHER_OPENWEATHERMAP_API_KEY`, so it needs the environment
// where that read is legal. The key itself comes from `vitest.config.ts` and is
// deliberately fake — `fetch` is stubbed below, so nothing leaves the machine.

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentWeather,
  getForecast,
} from "~/features/weather/server/openweathermap";

/**
 * The lowest seam in the weather path: `fetch` itself. Stubbing it here — rather
 * than mocking the module that calls it, or letting an E2E reach the real
 * provider — is what lets the request the tools send be asserted exactly, with
 * no network, no API key and nothing flaky.
 *
 * What the MCP contract depends on and is checked here: the endpoint each tool
 * hits, that the city is normalised on the way out, that `units` reaches the
 * querystring, and that a provider failure surfaces as a throw carrying the
 * status **and** the provider's own message — because that string is what a
 * client reads back inside an `isError` result.
 */

function stubFetch(response: Response) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: ReturnType<typeof stubFetch>): URL {
  const [input] = fetchMock.mock.calls[0] ?? [];
  if (!(input instanceof URL)) {
    throw new Error("fetch was not called with a URL");
  }
  return input;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCurrentWeather", () => {
  it("calls the weather endpoint with the normalised city, the key and the units", async () => {
    const fetchMock = stubFetch(Response.json({ name: "Da Nang" }));

    await getCurrentWeather("Đà Nẵng", "imperial");

    const url = requestedUrl(fetchMock);

    expect(url.origin + url.pathname).toBe(
      "https://api.openweathermap.org/data/2.5/weather",
    );
    expect(url.searchParams.get("q")).toBe("Da Nang");
    expect(url.searchParams.get("appid")).toBe("test-openweathermap-key");
    expect(url.searchParams.get("units")).toBe("imperial");
  });

  it("defaults to metric when the caller passes no units", async () => {
    const fetchMock = stubFetch(Response.json({}));

    await getCurrentWeather("London");

    expect(requestedUrl(fetchMock).searchParams.get("units")).toBe("metric");
  });

  it("never lets Next serve the call from its fetch cache", async () => {
    // A tool call asks what the weather is *now*; under `cacheComponents` an
    // uncached-looking fetch is exactly what Next would be free to reuse.
    const fetchMock = stubFetch(Response.json({}));

    await getCurrentWeather("London");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ cache: "no-store" });
  });

  it("returns the parsed body", async () => {
    stubFetch(Response.json({ name: "London", cod: 200 }));

    await expect(getCurrentWeather("London")).resolves.toMatchObject({
      name: "London",
    });
  });

  it("throws with the status and the provider's own message on a failure", async () => {
    // The whole point of keeping the body: "city not found" and "Invalid API
    // key" are the half a caller can act on, and a fake key produces the second.
    stubFetch(
      new Response('{"cod":401,"message":"Invalid API key"}', {
        status: 401,
        statusText: "Unauthorized",
      }),
    );

    await expect(getCurrentWeather("London")).rejects.toThrow(
      /OpenWeatherMap API error: 401 Unauthorized - .*Invalid API key/,
    );
  });
});

describe("getForecast", () => {
  it("calls the forecast endpoint, not the weather one", async () => {
    const fetchMock = stubFetch(Response.json({ list: [] }));

    await getForecast("Hồ Chí Minh");

    const url = requestedUrl(fetchMock);

    expect(url.origin + url.pathname).toBe(
      "https://api.openweathermap.org/data/2.5/forecast",
    );
    expect(url.searchParams.get("q")).toBe("Ho Chi Minh");
  });

  it("throws with the status and the provider's own message on a failure", async () => {
    stubFetch(
      new Response('{"cod":"404","message":"city not found"}', {
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(getForecast("Nowhere")).rejects.toThrow(
      /OpenWeatherMap API error: 404 Not Found - .*city not found/,
    );
  });
});
