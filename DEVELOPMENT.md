# Storyblok Dev Tools - Development Guide

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Storyblok account with access token

### Installation

```bash
# Clone the repository
git clone https://github.com/QuickLinkNet/StoryblokDevTools.git
cd StoryblokDevTools

# Install dependencies
npm install
```

### Project Structure

```
storyblok-dev-tools/
├── components/storyblok/     # Main component source code
│   ├── StoryblokDevTools.tsx # Main entry component
│   ├── StoryblokOverlay.tsx  # Overlay component
│   ├── tabs/                 # Individual tab components
│   └── ...
├── app/                      # Demo Next.js application (for development)
├── lib/                      # Utility functions
├── scripts/                  # Build scripts
└── dist/                     # Compiled package (auto-generated)
```

## Development Workflow

### Local Development

```bash
# Start the demo Next.js app
npm run dev

# Build Tailwind CSS
npm run build:tailwind

# Type checking
npm run typecheck

# Linting
npm run lint
```

Visit `http://localhost:3000` to see the DevTools in action.

### Making Changes

1. Edit components in `components/storyblok/`
2. The demo app in `app/` auto-reloads with your changes
3. Test thoroughly before building

## Building the Package

### Build for NPM Publishing

```bash
# Build the package (compiles TypeScript + embeds Tailwind CSS)
npm run build:package
```

This creates the `dist/` folder with:
- Compiled JavaScript files
- TypeScript declaration files (.d.ts)
- Embedded CSS

### What Gets Published

Only these files are included in the npm package (see `package.json` "files" field):
- `dist/` - Compiled code
- `README.md` - Documentation
- `LICENSE` - License file

## Testing the Package Locally

### Link Package Locally

```bash
# In this project directory
npm run build:package
npm link

# In your test project
npm link storyblok-dev-tools
```

### Test in a Real Project

Create a new Next.js project and test the package:

```bash
# Create a test project
npx create-next-app@latest test-app
cd test-app

# Install dependencies
npm install @storyblok/react
npm install storyblok-dev-tools

# Or use the linked version
npm link storyblok-dev-tools
```

Example integration in your test project:

```tsx
// app/page.tsx
"use client";

import { StoryblokDevTools } from 'storyblok-dev-tools';

export default function Home() {
  const story = {
    // Your test story data
  };

  return (
    <>
      <StoryblokDevTools story={story} accessToken="your-token" />
      <main>Your content</main>
    </>
  );
}
```

## Publishing to NPM

### Prerequisites

1. Create an NPM account at https://www.npmjs.com
2. Login via CLI: `npm login`

### Publishing Process

```bash
# Check what will be published
npm publish --dry-run

# Publish to NPM (prepublishOnly script runs automatically)
npm publish --access public
```

The package will be available at: https://www.npmjs.com/package/storyblok-dev-tools

### Version Updates

Follow semantic versioning:

```bash
# Patch release (1.0.0 -> 1.0.1) - Bug fixes
npm version patch

# Minor release (1.0.0 -> 1.1.0) - New features
npm version minor

# Major release (1.0.0 -> 2.0.0) - Breaking changes
npm version major

# Then publish
git push && git push --tags
npm publish
```

## Architecture

### Component Structure

```
StoryblokDevTools (Main Component)
└── StoryblokOverlay
    ├── OverlayToggle
    └── Tab Components
        ├── StoryInfoTab
        ├── BlocksTab
        ├── AssetsTab
        ├── SeoTab
        ├── PerformanceTab
        ├── DeveloperToolsTab
        ├── FieldUsageTab
        ├── QuickActionsTab
        └── JsonTab
```

### Styling Approach

- Uses Shadow DOM for complete style isolation
- Tailwind CSS compiled and embedded as string
- No external CSS dependencies needed
- Works with any CSS framework in parent app

### Key Features

1. **Zero Config**: Works out of the box
2. **Framework Agnostic**: No CSS conflicts
3. **TypeScript**: Full type safety
4. **Tree Shakeable**: Import only what you need
5. **Lightweight**: Minimal bundle impact

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist/ .next/
npm run build:package
```

### TypeScript Errors

```bash
# Check types
npm run typecheck

# Regenerate declaration files
npm run build:package
```

### Tailwind Not Updating

```bash
# Rebuild Tailwind CSS
npm run build:tailwind
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Run tests: `npm run typecheck && npm run lint`
6. Build: `npm run build:package`
7. Commit: `git commit -m "Add: feature description"`
8. Push: `git push origin feature/my-feature`
9. Create a Pull Request

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build Next.js demo app |
| `npm run build:tailwind` | Compile Tailwind CSS |
| `npm run build:package` | Build package for publishing |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## FAQ

**Q: Do I need to install Tailwind CSS in my project?**
A: No, the package includes embedded Tailwind CSS.

**Q: Can I use this with Next.js 13/14/15?**
A: Yes, all versions are supported.

**Q: Does it work with App Router?**
A: Yes, fully compatible with Next.js App Router.

**Q: How do I customize the appearance?**
A: The component uses Shadow DOM, so customization is limited. This ensures consistent appearance across all projects.
