# Payment Documentation

This is the documentation site for TODAQ Micro's payment system, built with Astro and deployed to `https://docs.m.todaq.net`.

## The API reference

The HTTP API reference at `/` is not written here. It is rendered by
[Scalar](https://github.com/scalar/scalar) from the OpenAPI document the payment
API generates about itself from its mounted route table, and serves at
`/v4/openapi.json`. Endpoints are documented in that repository, next to the
controllers that implement them; nothing in this repository needs to change when
the API does.

The document is fetched at runtime, so the reference always describes what the
environment is actually running. Point it elsewhere to preview changes before
they ship:

```bash
PUBLIC_OPENAPI_URL=http://localhost:8500/v4/openapi.json npm run dev
```

See `.env.example`. What remains in `src/content/` is the material Scalar does
not cover: the guides, the SDK references, and the interactive examples.

## Configuration

The variables in `.env.example`:

| Variable | Read | Purpose |
|---|---|---|
| `PUBLIC_OPENAPI_URL` | build time | OpenAPI document the reference at `/` renders. Defaults to production |
| `DELEGATE_CLIENT_ID`, `DELEGATE_CLIENT_SECRET` | server runtime, from `process.env` | The demo account's client pair, which `/api/delegate` (the persona demo's server route) uses to call the payment API. Required by that route, which answers 500 without them |

Astro loads `.env` into `import.meta.env`, not into `process.env`. To run
`/api/delegate` locally, export the pair in the shell that runs `npm run dev`,
or start the built server with `node --env-file=.env ./dist/server/entry.mjs`.
Never commit a client secret or give it a `PUBLIC_` prefix: `PUBLIC_*` values
are inlined into the build, and this repository is public.

## How HTML is Generated

This documentation site uses **Astro** with the following architecture:

### Content Management
- **MDX Files**: Documentation is written in `.mdx` files in `src/content/`
- **Collections**: Organized into two collections defined in `src/content/config.ts`:
  - `guide/` - User guides and tutorials
  - `reference/` - API documentation and technical references
- **Frontmatter**: Each file has metadata (title, description, pubDate, etc.)

### Build Process
```bash
# Development server
npm run dev          # Starts dev server at http://localhost:4321

# Production build  
npm run build        # Runs TypeScript check + builds static/server files
npm run preview      # Preview production build locally
```

### Tests
```bash
npm run build                    # The page checks run against the built site
npx playwright install chromium  # Once per machine
npm test                         # test:unit (vitest) then test:e2e (Playwright)
```

- `npm run test:unit` (`tests/unit/`) checks the MDX content: required
  frontmatter, unique guide `order`, no `[TOC]` or `(#)` links, staging hosts
  only in a labelled environment list, and no real-format credentials.
- `npm run test:e2e` (`tests/e2e/`) starts `node ./dist/server/entry.mjs` on a
  free port, with `/api/delegate` pointed at a closed local port, blocks every
  request that leaves the local server, and checks each page, the sidebar
  order, internal links and anchors, the theme toggle, the API reference mount
  and `/api/delegate`'s error answers.
- `DOCS_E2E_LIVE=1 npx playwright test embeds` also checks that the live
  element embeds mount. It loads production's CDN and API, so CI does not run it.
- To use a Chromium that is already installed, set
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path.

PR CI (`.github/workflows/test.yml`) runs the build and `npm test` on Node 18
and 20.

### Architecture
- **SSR Mode**: Configured for server-side rendering (`output: "server"`)
- **Node Adapter**: Uses standalone Node.js adapter for deployment
- **React Integration**: Supports React components within MDX content
- **Dynamic Navigation**: Sidebar navigation is auto-generated from content collections

### Content Structure
```
src/content/
├── guide/           # User guides (.mdx files)
│   ├── getting-started.mdx
│   ├── personas.mdx
│   └── ...
└── reference/       # SDK documentation (.mdx files)
    ├── payment-js/
    └── payment-node/

```

### Layout System
- **Article Layout**: `src/layouts/Article.astro` provides consistent page structure
- **Components**: Reusable React components in `src/components/`
- **Auto-generated Navigation**: Sidebar built from content collections

### Deployment
The site is deployed as a Node.js server application to `https://docs.m.todaq.net` with server-side rendering enabled for dynamic content and API integration.
