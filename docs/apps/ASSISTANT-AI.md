This is a chat application built with [assistant-ui](https://github.com/Yonom/assistant-ui) that connects to Google Gemini API.

## Getting Started

First, add your Google Gemini API key to `.env` file (in the monorepo root):

```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Chat Interface**: Modern chat UI built with assistant-ui
- **Google Gemini Integration**: Uses Gemini 2.5 Flash model for responses
- **Streaming Responses**: Real-time streaming of AI responses
- **Reasoning Support**: Displays AI reasoning process when available

## Architecture

The application consists of:

- **Frontend**: React components using `@assistant-ui/react` and `@assistant-ui/react-ai-sdk`
- **API Route**: `/api/chat` endpoint that handles chat requests
- **AI SDK**: Uses Vercel AI SDK with Google's AI SDK adapter
- **Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
