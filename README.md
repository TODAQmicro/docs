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
