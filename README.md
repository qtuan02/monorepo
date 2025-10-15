# Structure

```
monorepo
├── apps/                   # Main applications
│ ├── _template/            # Template for bootstrapping a new app (Next.js)
│ └── portfolio/            # Frontend portfolio (Next.js)
│
├── packages/               # Shared tooling/configurations (Web)
│ ├── env/                  # Environment variable manager (Web)
│ └── ui/                   # Reusable UI components (Web)
│
├── toolings/               # Shared tooling/configurations
│ ├── eslint/               # Config ESLint
│ ├── tailwind/             # Config TailwindCSS
│ └── typescript/           # Config TypeScript
│
├── .env.template           # Environment variables template
├── .gitignore              # Git ignore
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── turbo.json              # Config Turborepo
└── README.md               # Documentation
```
