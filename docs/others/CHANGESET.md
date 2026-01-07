# Guide to Publish Packages to NPM with Changesets

Guide to build and publish packages to npm using Changesets.

## Packages

| Internal Package | NPM Package         | Description   |
| ---------------- | ------------------- | ------------- |
| `@monorepo/ui`   | `@fe-monorepo/ui`   | UI components |
| `@monorepo/hook` | `@fe-monorepo/hook` | React hooks   |

## Main Steps

1. **Create Changeset** - Record changes and version bump type
2. **Bump Version** - Apply changesets and update version
3. **Build** - Build with rslib (automatically copy dist to public packages)
4. **Publish** - Publish to npm

## Step 1: Create Changeset

```bash
pnpm changeset
```

**Process:**

- Select package: `@monorepo/ui` or `@monorepo/hook`
- Select bump type: `patch` / `minor` / `major`
- Enter change description

**Version bump types:**

- `patch` (1.0.0 → 1.0.1) - Bug fixes
- `minor` (1.0.0 → 1.1.0) - New features
- `major` (1.0.0 → 2.0.0) - Breaking changes

## Step 2: Bump Version

```bash
pnpm changeset:version
```

This command will:

- Update version in `packages/ui-public/package.json` or `packages/hook-public/package.json`
- Create/update `CHANGELOG.md`
- Delete applied changeset files

## Step 3: Build Package

```bash
# Build UI package
pnpm build:package:ui

# Build Hook package
pnpm build:package:hook
```

**Build process:**

- `rslib build` creates ESM/CJS and `.d.ts` files in `packages/<pkg>/dist/`
- Script automatically copies `packages/<pkg>/dist/` → `packages/<pkg>-public/dist/`

## Step 4: Publish to NPM

### Prerequisites

```bash
# Login to npm
npm login

# Check login status
npm whoami
```

### Publish Production

```bash
pnpm changeset:publish
```

### Publish Beta (Recommended for testing)

```bash
# Publish beta
pnpm changeset:publish --tag beta

# Test beta version
npm install @fe-monorepo/ui@beta
npm install @fe-monorepo/hook@beta

# After testing OK, publish production
pnpm changeset:publish
```

## Complete Workflow

### Production Release

```bash
pnpm changeset                    # 1. Create changeset
pnpm changeset:version            # 2. Bump version
pnpm build:package:ui             # 3. Build UI (or build:package:hook)
pnpm changeset:publish            # 4. Publish
```

### Beta Release (Recommended)

```bash
pnpm changeset                      # 1. Create changeset
pnpm changeset:version              # 2. Bump version
pnpm build:package:ui               # 3. Build UI
pnpm build:package:hook             # 3. Build Hook
pnpm changeset:publish --tag beta   # 4. Publish beta
# Test: npm install @fe-monorepo/ui@beta
# Test: npm install @fe-monorepo/hook@beta
pnpm changeset:publish              # 5. Publish production
```

## Troubleshooting

### "You do not have permission to publish"

- Check: `npm whoami`
- Ensure you have permission to publish scope `@fe-monorepo`

### "This package has already been published"

- Create new changeset and bump version:
  ```bash
  pnpm changeset
  pnpm changeset:version
  ```

### "dist folder not found"

- Run build: `pnpm build:package:ui` or `pnpm build:package:hook`
- Check: `ls -la packages/ui-public/dist` or `ls -la packages/hook-public/dist`

## Best Practices

1. **Always test beta first** before publishing production
2. **Commit changeset files** to git before publishing
3. **Verify build output** before publishing
