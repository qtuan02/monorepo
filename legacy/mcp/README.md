# MCP Server

Model Context Protocol (MCP) server for providing weather data via OpenWeatherMap API.

## Overview

This is a Next.js application that implements an MCP server exposing weather-related tools:

- `get-current-weather`: Get current weather data for a city
- `get-weather-forecast`: Get 5-day weather forecast for a city

## Getting Started

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0
- OpenWeatherMap API key

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in root `.env`:

   ```env
   OPENWEATHERMAP_API_KEY=your-api-key-here
   ```

   Get your API key from [OpenWeatherMap](https://openweathermap.org/api)

3. Run development server:

   ```bash
   pnpm dev
   ```

   The MCP server will be available at `http://localhost:3001/api/mcp` (or the port configured in Next.js)

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## API Endpoints

### POST /api/mcp

MCP protocol endpoint for tool calls. This endpoint handles JSON-RPC 2.0 requests following the Model Context Protocol specification.

## Tools

### get-current-weather

Get current weather data for a city.

**Input:**

- `city` (string, required): City name (e.g., "London", "New York", "Tokyo")
- `units` (string, optional): Units of measurement. Options: "metric" (default), "imperial", "standard"

**Output:**

- Current weather data including temperature, humidity, wind speed, pressure, and weather conditions

### get-weather-forecast

Get 5-day weather forecast for a city.

**Input:**

- `city` (string, required): City name
- `units` (string, optional): Units of measurement. Options: "metric" (default), "imperial", "standard"

**Output:**

- 5-day forecast with hourly predictions

## Integration

This MCP server is designed to be used with the `assistant-ai` app. The assistant-ai app connects to this server via HTTP transport and exposes the weather tools to the AI model.

To connect assistant-ai to this server, set the `MCP_DOMAIN` environment variable:

```env
MCP_DOMAIN=http://localhost:3001/api/mcp
```

## Architecture

- **MCP Server**: Uses `@modelcontextprotocol/sdk` to implement the MCP protocol
- **HTTP Transport**: Uses `StreamableHTTPServerTransport` for stateless HTTP communication
- **OpenWeatherMap Integration**: Wrapper functions in `src/lib/openweathermap.ts` handle API calls
- **Tool Registration**: Tools are registered with Zod schemas for type-safe validation

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK for server implementation
- `zod` - Schema validation
- `next` - Next.js framework
- `@monorepo/env` - Environment variable management

## Development

The server runs on a separate port from other apps in the monorepo. By default, Next.js will use port 3000, but if that's taken, it will use the next available port.

To run both MCP server and assistant-ai together:

```bash
# Terminal 1: Run MCP server
pnpm dev:mcp

# Terminal 2: Run assistant-ai
pnpm dev:assistant-ai
```

## Environment Variables

Required:

- `OPENWEATHERMAP_API_KEY` - Your OpenWeatherMap API key

Optional (for assistant-ai integration):

- `MCP_DOMAIN` - URL of the MCP server (default: http://localhost:3001/api/mcp)
