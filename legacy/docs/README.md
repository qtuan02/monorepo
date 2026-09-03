# Documentation Overview

Welcome to the monorepo documentation! This directory contains comprehensive guides for all applications, packages, and development workflows.

## 📁 Documentation Structure

```
docs/
├── apps/                    # Application-specific documentation
│   ├── ASSISTANT-AI.md     # AI chat application guide
│   ├── DOCUMENTS.md        # Component documentation site guide
│   ├── STORYBOOK.md        # Storybook (Vite) for @monorepo/ui
│   └── MCP.md              # Model Context Protocol server setup
│
├── packages/                # Package-specific documentation
│   └── SENTRY.md           # Sentry error tracking setup
│
└── others/                  # General documentation
    ├── CHANGESET.md        # NPM package publishing guide
    └── VERCEL-DEPLOY.md    # Manual Vercel deploy hooks (GitHub Actions)
```

## 🚀 Quick Links

### Applications

| Application      | Description                   | Documentation                             |
| ---------------- | ----------------------------- | ----------------------------------------- |
| **Portfolio**    | Personal portfolio website    | [App README](../apps/portfolio/README.md) |
| **Assistant AI** | AI chat with Google Gemini    | [Guide](./apps/ASSISTANT-AI.md)           |
| **Documents**    | Component documentation       | [Guide](./apps/DOCUMENTS.md)              |
| **Storybook**    | UI preview for `@monorepo/ui` | [Guide](./apps/STORYBOOK.md)              |
| **MCP Server**   | Weather data MCP server       | [Guide](./apps/MCP.md)                    |

### Packages

| Package               | Description            | Documentation                                    |
| --------------------- | ---------------------- | ------------------------------------------------ |
| **@monorepo/ui**      | UI component library   | [Main README](../packages/ui/README.md)          |
| **@monorepo/hook**    | React hooks library    | [Main README](../packages/hook/README.md)        |
| **@fe-monorepo/ui**   | Published UI on NPM    | [Main README](../packages/ui-public/README.md)   |
| **@fe-monorepo/hook** | Published Hook on NPM  | [Main README](../packages/hook-public/README.md) |
| **@monorepo/sentry**  | Error tracking         | [Guide](./packages/SENTRY.md)                    |
| **@monorepo/env**     | Environment validation | [Main README](../packages/env/README.md)         |

### Development Guides

| Topic                      | Description                     | Documentation                      |
| -------------------------- | ------------------------------- | ---------------------------------- |
| **Publishing to NPM**      | Package versioning & publishing | [Guide](./others/CHANGESET.md)     |
| **Vercel (manual deploy)** | GitHub Actions + deploy hooks   | [Guide](./others/VERCEL-DEPLOY.md) |

## 📖 Documentation Guides

### For New Developers

Start here to get up to speed:

1. **[Main README](../README.md)** - Monorepo overview and setup
2. **Application Docs** - Specific app you'll be working on
3. **Package Docs** - Shared libraries you'll use

### For Application Development

Learn about each application:

- **[Assistant AI](./apps/ASSISTANT-AI.md)** - Chat interface with Google Gemini
  - Setup Google API key
  - Understanding MCP integration
  - Chat features and architecture

- **[Documents](./apps/DOCUMENTS.md)** - Component documentation site
  - Metadata JSON and preview registry
  - Adding new components/hooks
  - Deployment and environment variables
  - Testing and troubleshooting (including Vite on Windows)

- **[Storybook](./apps/STORYBOOK.md)** - Interactive UI stories for `@monorepo/ui`
  - Dev commands and ports
  - Shared `@monorepo/env/vite` usage

- **[MCP Server](./apps/MCP.md)** - Weather data tools
  - OpenWeatherMap API setup
  - Available tools
  - Integration with Assistant AI

### For Package Development

Understand the shared packages:

- **[Sentry](./packages/SENTRY.md)** - Error tracking
  - Setup for each app
  - Configuration options
  - Usage examples
  - Troubleshooting

### For Publishing

Learn how to publish packages:

- **[Changesets Guide](./others/CHANGESET.md)**
  - Creating changesets
  - Versioning strategy
  - Publishing to NPM
  - Release workflow

## 🎯 Common Tasks

### Setup New Application

1. Read [Main README](../README.md) for monorepo setup
2. Follow app-specific docs for environment variables
3. Run `pnpm dev:<app-name>` from root

### Add New Component

1. Create component in `packages/ui/src/components/`
2. Update Documents metadata and registry as described in [Documents](./apps/DOCUMENTS.md)
3. Optionally add or extend Storybook stories under `packages/ui/src/stories/`

### Configure Error Tracking

1. Read [Sentry Guide](./packages/SENTRY.md)
2. Add Sentry DSN to `.env`
3. Follow setup steps for your app
4. Test error capture

### Publish Package to NPM

1. Read [Changesets Guide](./others/CHANGESET.md)
2. Create changeset: `pnpm changeset`
3. Version: `pnpm changeset:version`
4. Publish: `pnpm changeset:publish`

## 🔍 Finding Information

### By Topic

- **Getting Started**: [Main README](../README.md)
- **API Integration**: [Assistant AI](./apps/ASSISTANT-AI.md), [MCP Server](./apps/MCP.md)
- **Error Tracking**: [Sentry Guide](./packages/SENTRY.md)
- **Documentation Site**: [Documents Guide](./apps/DOCUMENTS.md)
- **Publishing**: [Changesets Guide](./others/CHANGESET.md)
- **Vercel**: [Manual deploy hooks](./others/VERCEL-DEPLOY.md)

### By Technology

- **Next.js 15**: Portfolio, Assistant AI, MCP Server
- **React 19**: All applications
- **Vite**: Documents app, Storybook
- **Google Gemini**: Assistant AI
- **MCP**: MCP Server, Assistant AI
- **Sentry**: All production apps

## 📚 External Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### APIs & Services

- [Google Gemini AI](https://ai.google.dev/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Sentry](https://docs.sentry.io/)
- [Vercel](https://vercel.com/docs)

### Tools & Libraries

- [Turborepo](https://turbo.build/repo/docs)
- [pnpm](https://pnpm.io/)
- [Changesets](https://github.com/changesets/changesets)
- [Assistant UI](https://www.assistant-ui.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 🤝 Contributing to Documentation

### Adding New Documentation

1. Create markdown file in appropriate directory:
   - Applications: `docs/apps/`
   - Packages: `docs/packages/`
   - General guides: `docs/others/`

2. Follow the existing structure:
   - Start with overview/description
   - Include setup/installation steps
   - Add usage examples
   - Document troubleshooting

3. Update this README with links to new docs

### Documentation Standards

- **Use clear headings** - Make docs scannable
- **Include code examples** - Show, don't just tell
- **Add troubleshooting** - Address common issues
- **Link related docs** - Help users navigate
- **Keep it updated** - Review when code changes

## 🆘 Getting Help

### Where to Look

1. **This documentation** - Start here
2. **Code comments** - Check inline documentation
3. **Package READMEs** - See package-specific docs

### Need More Help?

- Check app-specific docs for technical issues
- Contact the maintainer for urgent matters

---

**Last updated**: April 2026  
**Maintained by**: Monorepo team

For the main monorepo overview, see [README.md](../README.md)
