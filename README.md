# Payment Documentation

This is the documentation site for TODAQ Micro's payment system, built with Astro and deployed to `https://docs.m.todaq.net`.

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
└── reference/       # API documentation (.mdx files)
    ├── payment-api/
    ├── payment-js/
    └── ...
```

### Layout System
- **Article Layout**: `src/layouts/Article.astro` provides consistent page structure
- **Components**: Reusable React components in `src/components/`
- **Auto-generated Navigation**: Sidebar built from content collections

### Deployment
The site is deployed as a Node.js server application to `https://docs.m.todaq.net` with server-side rendering enabled for dynamic content and API integration.
