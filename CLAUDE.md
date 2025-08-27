# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
# or
npm start
```

**Build for production:**
```bash
npm run build
```
This runs `astro check` (TypeScript checking) followed by `astro build`.

**Preview production build:**
```bash
npm run preview
```

**TypeScript checking only:**
```bash
npx astro check
```

## Architecture Overview

This is an **Astro-based documentation site** for TODAQ Micro's payment system, running in server mode with React integration.

### Key Components:

**Content Architecture:**
- Uses Astro's content collections with two main types: `guide` and `reference`
- Content stored in `/src/content/` as MDX files with frontmatter schemas
- Navigation dynamically generated from collection entries

**Layout Structure:**
- Main layout: `/src/layouts/Article.astro` - provides sidebar navigation and content area
- Header and navigation components are React-based (`.tsx`)
- Uses Theme-UI for styling with emotion/react

**API Integration:**
- `/src/pages/api/delegate.ts` - Server endpoint for payment validation and persona delegation
- Integrates with `@todaqmicro/payment-node` SDK
- Handles payment verification and persona assignment workflow

**Key Dependencies:**
- **@todaqmicro/payment-js** and **@todaqmicro/payment-node** - Core payment SDKs
- **theme-ui** - Styling system
- **react-wavify** - Animation components for examples

### Content Organization:
- **Guides:** Getting started, personas, reactive payments, transparency
- **References:** Payment API (v2/v3), Payment JS, Payment Node, React Payment JS
- **Examples:** Interactive demos including Sound Academy showcase

### Development Notes:
- Server-side rendering enabled (`output: "server"`)
- TypeScript with strict Astro config
- Content is deployment target: `docs.m.todaq.net`
- Uses Docker and docker-compose for containerized deployment