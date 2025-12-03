# Types

This directory contains TypeScript type definitions for the MCP weather server.

## Structure

- `weather.ts` - Weather-related types for OpenWeatherMap API and MCP tool outputs
- `index.ts` - Central export point for all types

## Usage

Import types from the central export:

```typescript
import type {
  CurrentWeatherOutput,
  ForecastOutput,
  WeatherUnits,
} from "~/types";
```

Or import directly from the weather module:

```typescript
import type { CurrentWeatherOutput } from "~/types/weather";
```

## Available Types

### Weather Units
- `WeatherUnits` - Units of measurement: "metric" | "imperial" | "standard"

### API Response Types
- `CurrentWeatherResponse` - OpenWeatherMap current weather API response
- `ForecastResponse` - OpenWeatherMap forecast API response
- `WeatherError` - OpenWeatherMap API error response

### MCP Tool Output Types
- `CurrentWeatherOutput` - Transformed current weather data for MCP tools
- `ForecastOutput` - Transformed forecast data for MCP tools
- `ForecastItemOutput` - Individual forecast item data

