# Monorepo

## 📁 Structure

```
monorepo/
├── apps/                      # Applications
│   ├── _template/            # Next.js app template for bootstrapping
│   ├── assistant-ai/         # AI chat application (Next.js 15 + React 19)
│   ├── documents/            # Component docs site (Vite + React 19)
│   ├── mcp/                  # Model Context Protocol server
│   ├── portfolio/            # Portfolio website (Next.js 15 + React 19)
│   └── storybook/            # Storybook for @monorepo/ui (Vite)
│
├── packages/                  # Shared packages
│   ├── env/                  # Environment variable validation
│   ├── hook/                 # Reusable React hooks
│   ├── hook-public/          # Published Hook package for NPM
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
    └── others/               # General documentation
```

## Applications

### Live Applications

- **[Assistant AI](https://chat-assistant-ai-tuan.vercel.app/)** - Chat application with Google Gemini integration
  - Source: `apps/assistant-ai/`
- **[Portfolio](https://portfolio-ui-2025.vercel.app)** - Frontend portfolio
  - Source: `apps/portfolio/`
- **[Documents](https://documents-ui.vercel.app)** - UI & hooks documentation site
  - Source: `apps/documents/`
- **[Storybook](https://storybook-monorepo-ui.vercel.app)** - Interactive stories for `@monorepo/ui`
  - Source: `apps/storybook/`

### External Projects

- **[Discord Bot](https://github.com/qtuan02/discord-bot)** - Discord bot integrated with Assistant AI API
  - Live: [Active Domain](https://discord-bot-pfuo.onrender.com) (⚠️ Note: Render shuts down after 15 minutes of inactivity)
  - Discord Bot: [Channel Discord](https://discord.com/channels/1084718391539023922/1084718392260440090)
  - Description: Discord bot that listens to messages and responds using the Assistant AI API for chat responses
  - How to test: Go to the Discord channel, tag `@Peter` and send a message

## Documentation

- [Documents](./docs/apps/DOCUMENTS.md) — Component and hook documentation site (Vite)
- [Storybook](./docs/apps/STORYBOOK.md) — UI preview for `@monorepo/ui`
- [Assistant AI](./docs/apps/ASSISTANT-AI.md) — Chat application with Google Gemini integration
- [MCP Server](./docs/apps/MCP.md) — Model Context Protocol server for weather data
- [Sentry integration](./docs/packages/SENTRY.md) — Error tracking and performance monitoring
- [Publishing to NPM](./docs/others/CHANGESET.md) — Versioning and publishing UI/Hook packages
- [Vercel manual deploy](./docs/others/VERCEL-DEPLOY.md) — GitHub Actions deploy hooks
- [Docs index](./docs/README.md) — Full table of contents
