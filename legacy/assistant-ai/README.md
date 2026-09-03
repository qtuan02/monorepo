# Assistant AI Application

A modern chat application built with [assistant-ui](https://github.com/Yonom/assistant-ui) that connects to Google Gemini API for AI-powered conversations.

## Overview

This application provides a chat interface for interacting with Google's Gemini AI model, featuring:

- **Modern Chat UI**: Built with assistant-ui components
- **Google Gemini Integration**: Uses Gemini 2.5 Flash model via Vercel AI SDK
- **Streaming Responses**: Real-time streaming of AI responses
- **Reasoning Support**: Displays AI reasoning process when available
- **Markdown Support**: Renders markdown content with syntax highlighting
- **Attachment Support**: File attachment capabilities
- **Tool Support**: Handles AI tool calls and responses

## Project Structure

```
assistant-ai/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Chat API endpoint
│   ├── assistant.tsx          # Main assistant component
│   ├── layout.tsx              # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── attachment.tsx         # File attachment component
│   ├── markdown-text.tsx       # Markdown renderer
│   ├── reasoning.tsx           # Reasoning display component
│   ├── thread.tsx              # Chat thread component
│   ├── tool-fallback.tsx       # Tool call fallback
│   └── tooltip-icon-button.tsx # Icon button with tooltip
├── env.ts                      # Environment variable validation
└── next.config.ts              # Next.js configuration
```

## Features

### Chat Interface

- **Thread Management**: Organized chat threads
- **Message Streaming**: Real-time message streaming
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Reasoning Display**: Shows AI reasoning process
- **Tool Calls**: Handles AI tool invocations

### AI Integration

- **Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Streaming**: Real-time response streaming
- **Reasoning**: Supports reasoning mode for detailed explanations
- **Error Handling**: Graceful error handling and fallbacks

## Getting Started

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0
- Google Gemini API key

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in root `.env`:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
   ```

3. Run development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## Dependencies

### Core Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@assistant-ui/react` - Assistant UI components
- `@assistant-ui/react-ai-sdk` - AI SDK integration
- `@assistant-ui/react-markdown` - Markdown rendering
- `@ai-sdk/google` - Google AI SDK adapter
- `ai` - Vercel AI SDK
- `motion` - Animation library
- `lucide-react` - Icons
- `zustand` - State management
- `remark-gfm` - GitHub Flavored Markdown support

### Shared Packages

- `@monorepo/ui` - Shared UI components
- `@monorepo/env` - Environment variable management

## Architecture

### Frontend

The frontend uses React Server Components and Client Components:

- **Server Components**: Layout and page structure
- **Client Components**: Interactive chat interface
- **State Management**: Zustand for client state
- **Animations**: Motion library for smooth animations

### API Route

The `/api/chat` route:

1. Receives chat messages from the client
2. Converts messages to model format
3. Streams responses from Google Gemini
4. Returns streaming response to client

### AI Integration

- **SDK**: Vercel AI SDK (`ai`)
- **Adapter**: Google AI SDK adapter (`@ai-sdk/google`)
- **Model**: `gemini-2.5-flash`
- **Features**: Streaming, reasoning support

## Key Components

### Thread Component

Main chat interface component that handles:

- Message display
- Input handling
- Streaming updates
- Tool call rendering

### Markdown Text

Renders markdown content with:

- Syntax highlighting
- Code blocks
- GitHub Flavored Markdown support

### Reasoning Component

Displays AI reasoning process when available, showing:

- Reasoning steps
- Thought process
- Decision making

## Environment Variables

Required environment variables:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key

Optional (configured via `@monorepo/env`):

- `NEXT_PUBLIC_ENV` - Environment (local, development, production)

## Deployment

The app is configured for Vercel deployment with:

- API route optimization
- Environment variable validation
- Build optimization

## Live Application

- **Production**: [Assistant AI](https://chat-assistant-ai-tuan.vercel.app/)

## Differences from Template

This app has a different structure from the template:

1. **No `src/` folder**: Uses Next.js App Router directly
2. **No i18n**: Single language (English)
3. **No Sentry**: Error tracking not configured
4. **Different dependencies**: AI-focused dependencies
5. **Simpler structure**: Focused on chat functionality

## Development

### Code Style

- Follows monorepo ESLint and Prettier configurations
- TypeScript for type safety
- Server Components by default
- Client Components only when needed

### Best Practices

- Use Server Components for static content
- Use Client Components for interactivity
- Proper error handling
- Type safety with TypeScript
- Performance optimization

## Resources

- [Assistant UI Documentation](https://assistant-ui.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For questions or issues:

- Check the main monorepo `README.md`
- Review `.cursor/rules/` for coding guidelines
- See `docs/apps/ASSISTANT-AI.md` for additional details
