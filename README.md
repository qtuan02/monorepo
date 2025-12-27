# Monorepo

## 📁 Structure

```
monorepo/
├── apps/                      # Applications
│   ├── _template/            # Next.js app template for bootstrapping
│   ├── assistant-ai/         # AI chat application (Next.js 15 + React 19)
│   ├── documents/            # Component docs site (Vite + React 19)
│   ├── mcp/                  # Model Context Protocol server
│   └── portfolio/            # Portfolio website (Next.js 15 + React 19)
│
├── packages/                  # Shared packages
│   ├── db/                   # Database package with Prisma ORM + MongoDB
│   ├── env/                  # Environment variable validation
│   ├── hook/                 # Reusable React hooks
│   ├── sentry/               # Sentry error tracking integration
│   ├── ui/                   # UI component library (shadcn/ui based)
│   └── ui-public/            # Published UI package for NPM
│
├── toolings/                  # Shared configurations
│   ├── eslint/               # ESLint configuration
│   ├── prettier/             # Prettier configuration
│   ├── tailwind/             # TailwindCSS configuration
│   └── typescript/           # TypeScript configuration
│
├── turbo/                     # Turborepo generators
│   └── generators/           # Code generation templates
│
└── docs/                      # Documentation
    ├── apps/                 # Application-specific docs
    ├── packages/             # Package-specific docs
    ├── bmad/                 # BMAD workflow documentation
    └── others/               # General documentation
```

## Applications

### Live Applications

- **[Assistant AI](https://chat-assistant-ai-tuan.vercel.app/)** - Chat application with Google Gemini integration
  - Source: `apps/assistant-ai/`
- **[Portfolio](https://portfolio-ui-2025.vercel.app)** - Frontend portfolio
  - Source: `apps/portfolio/`
- **[Documents](https://documents-ui.vercel.app)** - Frontend documents
  - Source: `apps/documents/`

### External Projects

- **[Discord Bot](https://github.com/qtuan02/discord-bot)** - Discord bot integrated with Assistant AI API
  - Live: [Active Domain](https://discord-bot-pfuo.onrender.com) (⚠️ Note: Render shuts down after 15 minutes of inactivity)
  - Discord Bot: [Channel Discord](https://discord.com/channels/1084718391539023922/1084718392260440090)
  - Description: Discord bot that listens to messages and responds using the Assistant AI API for chat responses
  - How to test: Go to the Discord channel, tag `@Peter` and send a message

## Documentation

- [Assistant AI](./docs/apps/ASSISTANT-AI.md) - Chat application with Google Gemini integration
- [MCP Server](./docs/apps/MCP.md) - Model Context Protocol server for weather data
- [Sentry Integration](./docs/packages/SENTRY.md) - Error tracking and performance monitoring setup
- [Database Package](./docs/packages/DATABASE.MD) - Prisma ORM and MongoDB setup and usage
- [Publishing to NPM](./docs/others/CHANGESET.md) - Guide for publishing the UI package to npm
