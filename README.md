# Structure

```
monorepo
├── apps/                   # Main applications
│ ├── _template/            # Template for bootstrapping a new app (Next.js)
│ ├── _portfolio/           # Portfolio application v1 (Next.js)
│ ├── assistant-ai/         # Chat application with Google Gemini (Next.js)
│ ├── document/             # Admin dashboard application (Next.js)
│ └── portfolio/            # Frontend portfolio (Next.js)
│
├── packages/               # Shared packages
│ ├── db/                   # Database package with Prisma ORM and MongoDB
│ ├── env/                  # Environment variable manager
│ ├── hook/                 # Reusable React hooks
│ ├── sentry/               # Sentry integration package
│ ├── ui/                   # Reusable UI components library
│ └── ui-public/            # Public UI components (built package)
│
├── toolings/               # Shared tooling/configurations
│ ├── eslint/               # ESLint configuration
│ ├── prettier/             # Prettier configuration
│ ├── tailwind/             # TailwindCSS configuration
│ └── typescript/           # TypeScript configuration
│
├── docs/                   # Documentation
│ └── apps/                 # Application-specific documentation
│
├── turbo/                  # Turborepo generators
│ └── generators/           # Code generation templates
│
├── .env.template           # Environment variables template
├── .gitignore              # Git ignore
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── turbo.json              # Turborepo configuration
└── README.md               # Documentation
```

## Applications

### Live Applications

- **[Assistant AI](https://chat-assistant-ai-tuan.vercel.app/)** - Chat application with Google Gemini integration
  - Source: `apps/assistant-ai/`
- **[Portfolio](https://portfolio-ui-2025.vercel.app)** - Frontend portfolio
  - Source: `apps/portfolio/`
- **[Portfolio v1](https://portfolio-ui-2025v1.vercel.app)** - Portfolio application v1
  - Source: `apps/_portfolio/`

### External Projects

- **[Discord Bot](https://github.com/qtuan02/discord-bot)** - Discord bot integrated with Assistant AI API
  - Live: [Active Domain](https://discord-bot-pfuo.onrender.com) (⚠️ Note: Render shuts down after 15 minutes of inactivity)
  - Discord Bot: [Channel Discord](https://discord.com/channels/1084718391539023922/1084718392260440090)
  - Description: Discord bot that listens to messages and responds using the Assistant AI API for chat responses
  - How to test: Go to the Discord channel, tag `@Peter` and send a message

## Documentation

- [Assistant AI](./docs/apps/ASSISTANT-AI.md) - Chat application with Google Gemini integration
- [Sentry Integration](./docs/packages/SENTRY.md) - Error tracking and performance monitoring setup
- [Database Package](./docs/packages/DATABASE.MD) - Prisma ORM and MongoDB setup and usage
- [Publishing to NPM](./docs/others/CHANGESET.md) - Guide for publishing the UI package to npm
