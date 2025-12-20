Model Context Protocol (MCP) server that provides weather data tools via OpenWeatherMap API.

## Getting Started

Add your OpenWeatherMap API key to `.env` file (in the monorepo root):

```
OPENWEATHERMAP_API_KEY=your-api-key-here
```

Get your API key from [OpenWeatherMap](https://openweathermap.org/api).

Then, run the development server:

```bash
pnpm dev
```

The MCP server will be available at `http://localhost:3001/api/mcp` (or the port configured in Next.js).

## Features

- **MCP Protocol**: Implements Model Context Protocol for tool-based AI interactions
- **Weather Tools**: Provides current weather and 5-day forecast data
- **HTTP Transport**: Stateless HTTP communication using JSON-RPC 2.0
- **Type Safety**: Zod schemas for input/output validation

## Available Tools

- `hello-world`: Simple test tool that returns a greeting message
- `get-weather`: Get current weather data for any city (temperature, humidity, wind speed, etc.)
- `get-forecast`: Get 5-day weather forecast with hourly predictions

## Integration

This MCP server is designed to be used with the `assistant-ai` app. The assistant-ai app connects to this server via HTTP transport and exposes the weather tools to the AI model.

To connect assistant-ai to this server, set the `MCP_DOMAIN` environment variable:

```env
MCP_DOMAIN=http://localhost:3001/api/mcp
```

## Architecture

- **MCP Server**: Uses `@modelcontextprotocol/sdk` to implement the MCP protocol
- **HTTP Transport**: Uses `StreamableHTTPServerTransport` for stateless HTTP communication
- **OpenWeatherMap Integration**: Wrapper functions handle API calls and response formatting
- **Next.js API Route**: `/api/mcp` endpoint handles both GET (SSE) and POST (JSON-RPC) requests
