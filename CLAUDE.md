# docs

The public developer documentation site for Qatom payments, served at https://docs.m.todaq.net and read by merchants and developers integrating the platform. The home page `/` is the HTTP API reference: Scalar renders the payment API's own OpenAPI document (`/v4/openapi.json`) in the browser, so it always describes what the API is running. Around it sit hand-written MDX guides, SDK references for payment-js (the browser loader for the payment, auth, verify and payback elements, in the spirit of stripe-js) and payment-node, live element demos, and one server route that backs the persona demo. Stack: Astro 4 with React islands and the `@astrojs/node` standalone adapter (`output: "server"`); guide and reference pages are prerendered at build; TypeScript uses Astro's strict config.

## Commands

| Task | Command |
|---|---|
| Install | `npm ci` (CI uses it; `npm install` when changing dependencies) |
| Dev server | `npm run dev` (alias `npm start`), http://localhost:4321. `.claude/launch.json` defines this as the `docs` preview |
| Type-check only | `npx astro check` |
| Build | `npm run build` = `astro check && astro build`, output in `dist/` |
| Preview the build | `npm run preview` |
| Run the built server | `node ./dist/server/entry.mjs` (what the image runs; honours `HOST` and `PORT`) |
| Container image | `docker build -t docs .` after `npm run build`: the Dockerfile copies `dist/`, it does not build |
| Lint | No linter yet. `npm run build` is the closest check |
| Tests | No unit or e2e test runner yet. Verify with `npm run build` plus the page checks under Testing |

## Setup

- **Node 20.** Nothing pins it in the repo (no `.nvmrc`, no `engines`). The image uses `node:20`, `shell.nix` provides `nodejs_20`, and PR CI builds on Node 18 and 20. Moving to the org's Node 24 is one PR that adds `.nvmrc` and updates the Dockerfile, `shell.nix` and both workflows together. Until it lands, this repo is a recorded exception to the shared Node 24 standard, because those four files must move at once; do not bump one of them alone.
- **Optional nix:** `.envrc` runs `use nix` for direnv users; `shell.nix` supplies Node 20 and a few CLI tools.
- **No GitHub Packages auth.** `@todaqmicro/payment-js` and `@todaqmicro/payment-node` install from public npm. If your `~/.npmrc` maps the `@todaqmicro` scope to GitHub Packages, npm looks for them there instead; add `--@todaqmicro:registry=https://registry.npmjs.org` to the install. The tracked `.npmrc` is empty; keep it free of registries and tokens, and do not delete it: the Dockerfile runs `rm .npmrc`, so `docker build` fails without it.
- **No local services needed.** By default the reference reads production's OpenAPI document. To preview API reference changes, run payment locally (port 8500) or use staging and set `PUBLIC_OPENAPI_URL`.
- **.env:** `cp .env.example .env` and uncomment one `PUBLIC_OPENAPI_URL` line. Astro loads `.env` into `import.meta.env` in dev and build, not into `process.env`; restart the dev server after editing it. To run `/api/delegate`, export `DELEGATE_CLIENT_ID` and `DELEGATE_CLIENT_SECRET` in the shell that runs `npm run dev`, or start the built server with `node --env-file=.env ./dist/server/entry.mjs`. Only `.env` and `.env.production` are gitignored, so do not create `.env.local` or other variants. The Dockerfile runs `COPY . .`, so `.dockerignore` keeps `.env`, `.env.*`, `.git` and `.claude` (agent worktrees, each with its own `.env`) out of the image; keep it.

## Configuration

| Variable | Required | Read | Purpose |
|---|---|---|---|
| `PUBLIC_OPENAPI_URL` | no | build time (Astro inlines `PUBLIC_*`) | OpenAPI document Scalar renders at `/`. Defaults to the production payment API's `/v4/openapi.json` |
| `API_BASE_URL` | no | server runtime, when payment-node loads | Payment API base URL for `/api/delegate`. Defaults to production |
| `DELEGATE_CLIENT_ID`, `DELEGATE_CLIENT_SECRET` | for `/api/delegate` | server runtime, `process.env` on the first request | The demo account's client pair. Without them the route logs the missing names and answers 500; the rest of the site is unaffected |
| `HOST`, `PORT` | set by Dockerfile | server runtime | Listen address of the standalone server (`0.0.0.0`, `80` in the image) |

- Build-time (`PUBLIC_*`) values for production go in the build step `env` of `.github/workflows/production.yml`. It does not set `PUBLIC_OPENAPI_URL`, so production renders the production document. That step also exports `API_BASE_URL` and `CDN_*` variables; they do not reach the running server, and nothing in `src/` reads the `CDN_*` names. Do not add runtime variables there.
- The `PUBLIC_OPENAPI_URL` and `API_BASE_URL` defaults are the public production API on purpose, as is the CDN host `Element` and the persona demos load `micropay.js` from: the site documents production and must run with no configuration. This is a deliberate exception to the shared fail-closed and no-hard-coded-host rules, for public endpoint URLs only; a secret never gets a default.
- Runtime values come from the deployed service's environment, which is managed outside this repo. A new runtime variable needs a maintainer to add it before the change that reads it is merged.
- Env names inside MDX code samples (for example `VITE_TODAQ_PUBLIC_SECRET`) belong to the integrator's app, not this site.

## Architecture

| Path | Role |
|---|---|
| `src/pages/index.astro` | API reference: `@scalar/astro` in client render mode, Brand OS re-skin (`scalarTheme`), snippet picker limited to curl and Node fetch (`HIDDEN_CLIENTS`), theme sync with the site toggle |
| `src/content/config.ts` | Collections `guide` and `reference`. Frontmatter: `title`, `description`, `pubDate` required; `updatedDate`, `heroImage`, `heroAlt` optional |
| `src/content/guide/*.mdx` | Guides, served at `/guide/<slug>/` |
| `src/content/reference/{payment-js,payment-node}/` | SDK references, served at `/reference/<dir>/<slug>/` |
| `src/pages/{guide,reference}/[...slug].astro` | Prerendered routes for the two collections |
| `src/layouts/Article.astro` | Page shell and sidebar. Groups references by slug prefix (`payment-js`, `payment-node`); other slugs are listed ungrouped |
| `src/components/Header/Header.astro`, `src/components/Head.astro`, `src/components/ThemeScript.astro` | Header nav and theme toggle, `<head>` (title, fonts), pre-paint theme |
| `src/components/Navigation/` | Sidebar lists (React, rendered on the server) |
| `src/components/Element/` | Live element embed for MDX (`<Element type="payment" hash="…" client:load />`); loads `micropay.js` from the CDN host in `environment` (production by default) |
| `src/pages/guide/example/*-persona.astro` | Standalone persona demos, embedded by iframe in `guide/personas.mdx` |
| `src/pages/api/delegate.ts` | The only server route: `POST /api/delegate` validates a payment and delegates a persona through payment-node, signed in with the `DELEGATE_*` pair from `process.env` |
| `src/styles/` | `main.css` imports `variables.css` (Brand OS tokens), `reset.css`, `typography.css`, `layout.css` |

The one way to do each thing here:

- **HTTP API docs are never hand-written.** Wording, examples and schemas are fixed in the payment repo, next to the controller; the reference shows them once payment deploys. Do not vendor an `openapi.json` or add endpoint pages.
- **Prose is MDX in a collection.** A leading `_` keeps a file out of its collection (unpublished). A new SDK directory under `reference/` also needs its sidebar group in `Article.astro`.
- **Styling is CSS custom properties** from `src/styles/variables.css`, plus scoped `<style>` in `.astro` files. theme-ui, `@emotion/react`, `@theme-ui/mdx`, Tailwind (`tailwindcss`, `@tailwindcss/typography`, `postcss`, `autoprefixer`), `flexsearch`, `react-wavify` and `save` are declared but unused by the live site; do not build on them.
- **Components:** `.astro` for page chrome; React `.tsx` only for MDX embeds or interactive parts, with `client:load` only where it must run in the browser.
- **Theme:** one mechanism, `data-theme` on `<html>` persisted in `localStorage` key `theme`. `ThemeScript.astro` sets it before paint, `Header.astro`'s inline script toggles it, `index.astro` mirrors it into Scalar. Do not add another toggle.
- **Brand values live in two places:** `variables.css` and `scalarTheme` in `index.astro`. Take values from the Qatom Brand OS kit and change both together.
- **Unused files, do not import or extend:** `Header/index.tsx`, `Header/ThemeToggle.tsx`, `Examples/SoundAcademy/`, `PersonaExample.tsx`, `constants.ts`, `utils.ts`, `pages/guide/example/index.astro`, `compose.yaml` (serves a missing `./example`). `Scripts.astro` is empty but still rendered by `Article.astro`. Remove them in a dedicated cleanup PR.

## Testing

- There is no test runner and no linter. PR CI calls `npm run lint --if-present` and `npm run test --if-present`, which do nothing until those scripts exist; adding them to `package.json` puts them in CI. The first test runner added here is vitest (Playwright for page checks), wired as `npm test`.
- The gate is `npm run build`: `astro check` type-checks `.astro`/`.ts`/`.tsx`, and the build fails on frontmatter that does not match `src/content/config.ts`. It must pass on Node 18 and 20 (the PR CI matrix).
- Every change also needs: open each changed page in `npm run dev` (or `npm run preview`) in light and dark themes. For reference changes, `/` renders and the picker offers only curl and Node fetch.
- Code samples: run shell samples against local or staging payment (at minimum `bash -n` on the block), and check paths, methods and fields against the OpenAPI document.
- Links: the target slug must exist (`/reference/payment-node/usage/`; there is no `/reference/payment-node` page). No `(#)` placeholder links. `[TOC]` is not expanded (no remark plugins are configured), so do not add it.
- Element embeds, `/guide/example/*` and `/api/delegate` call the production payment API and CDN by default, even in dev. View them, but do not complete payments or submit the persona form while testing. To exercise `/api/delegate` without reaching production, run the built server with `API_BASE_URL=http://127.0.0.1:9` and dummy `DELEGATE_*` values: a valid body answers 502, a malformed one 400, and a missing pair 500.

## Deploy & release

| Workflow | Trigger | What it does |
|---|---|---|
| `test.yml` (Node.js CI) | every `pull_request` | Node 18.x and 20.x: `npm ci`, `npm run build`, then `lint` and `test` if present |
| `production.yml` | push to `main` | `npm install` and `npm run build` on the runner, `docker build`, push the image, roll the production service and wait until it is stable |

- Merging to `main` is a production release. There is no staging deployment of the site and no manual release step (no migrations).
- `production.yml` builds the image from its own checkout, so its checkout step sets `persist-credentials: false`: otherwise `actions/checkout` writes the job's GitHub token into `.git/config`. Keep it, and keep `.git` in `.dockerignore`.
- The deploy job uses `npm install` on the runner's default Node, while PR CI uses `npm ci`. Commit `package-lock.json` with every dependency change so both resolve the same tree.
- No `workflow_dispatch` exists. To redeploy `main` unchanged, a human re-runs the latest `production.yml` run in GitHub Actions; do not push empty commits. Roll back by reverting through a PR.
- Verify a release: the `production.yml` run is green (it waits for stability), then https://docs.m.todaq.net/ renders the reference, `/guide/getting-started/` and `/reference/payment-js/payment-element/` load, and the changed pages show the change.

## Related repos & cross-checks

This site depends on:
- **payment**: the OpenAPI document rendered at `/`, the v4 endpoints the guides show, and the API behind `/api/delegate` and the demos.
- **payment-js**: `micropay.js`, its browser bundle (`loadMicroPayments(publicSecret)` → `elements().create(type, options)` → `mount(el)`), loaded from the CDN by `Element` and the demos; guides also teach `npm install @todaqmicro/payment-js`. It is the supported, friendly way for integrators to load the elements.
- **payment-element, auth-element, verify-element, payback-element**: the element UIs payment-js mounts; their options are what the payment-js reference pages document (the payback page, `_payback-element.mdx`, is unpublished).
- **payment-node**: `@todaqmicro/payment-node`, used by `/api/delegate` (with `apiVersion: 'v2'`) and documented at `/reference/payment-node/usage/`.

Nothing imports this repo, but other services link to it: payment's OpenAPI document (`info.contact`) points at `https://docs.m.todaq.net`, and the OAuth protected-resource metadata served by payment and mcp sets `resource_documentation` to `https://docs.todaq.net/mcp`, a path this site has no page for.

| Change here | Cross-check |
|---|---|
| An element option, event or theme on a payment-js page | payment-js's element types and options, and the element's repo; the CDN `micropay.js` must already ship it, because these pages describe production |
| An HTTP sample in a guide | Path, method, auth and body against payment's OpenAPI document (the reference at `/`); new content documents v4 only |
| `/api/delegate` or the payment-node page | The installed payment-node version in `package-lock.json` and that package's API |
| Moving or renaming pages, or adding an MCP page | Grep payment and mcp for `docs.m.todaq.net` and `docs.todaq.net`; update `Header.astro` nav links (`/`, `/guide/getting-started/`, `/reference/payment-js/payment-element/`) |
| Integrator-facing behaviour changes in payment-js or an element repo | A docs PR here describing it, merged once that release is live |

## Rules specific to this repo

- No credentials in `src/`, MDX or samples. The one exception is the demo account's public secret that live embeds pass to `loadMicroPayments`, which is public by design. Code samples use placeholders: `<PUBLIC_SECRET>` in browser samples, `<CLIENT_ID>` and `<CLIENT_SECRET>` in server samples. Example tokens, secrets and keys are visibly fake, never real-format values or anything copied from a real response. Twin API keys never appear in docs.
- A credential a server route needs is read from `process.env` by name at runtime. Never give a secret a `PUBLIC_` prefix: `PUBLIC_*` values are inlined into the build.
- Server routes never log request bodies, emails, payment hashes or nonces, tokens, or SDK objects and responses. Log an event name and a status.
- Server routes validate their JSON body with zod (`import { z } from 'astro/zod'`) and return 400 on failure.
- payment-node 0.3.6 itself `console.log`s the client secret, tokens, request headers and the persona's name and email. `/api/delegate` runs every SDK call inside `quietly()`, which mutes `console.log`, and logs with `console.info`/`console.error` only. Keep new SDK calls inside it until a payment-node release stops logging.
- Recorded exception to the shared v4-only rule: payment-node still calls the payment API's v2 and v3 endpoints, so `/api/delegate` (`apiVersion: 'v2'`) and the payment-node page use it as published until payment-node moves to v4. HTTP samples in guides stay v4.
- Shell samples run when pasted: a continuation is `\` immediately followed by a newline, with no blank lines inside a command, and paths match the spec exactly (no trailing slash). Some curl blocks in `getting-started.mdx` do not yet; fix them when editing that page.
- Integrator-facing samples use the production hosts (`pay.m.todaq.net`, `cdn.m.todaq.net`); staging hosts appear only in an explicitly labelled environment list. `getting-started`, `reactive-payment` and `transparent` still load `micropay.js` from the staging CDN; fix this when editing them.
- Scripts from third-party CDNs load at an exact version; Scalar takes a `cdn` key in its `configuration` for this.
- Customise Scalar through its configuration and `--scalar-*` custom properties. Hide its elements by stable attributes (as the `href` rule does), not its utility classes. After any `@scalar/astro` bump, check `/` in both themes.
- `Head.astro`'s `<title>` and older pages still say "TODAQ Micro". Rename existing text in a dedicated brand PR, not in passing.

## Where the documentation lives

There is no OpenAPI or Postman file here: `/` renders payment's live `/v4/openapi.json`.

| File | What it covers | Update it when |
|---|---|---|
| `README.md` | What the site is, how `/` is rendered and previewed (`PUBLIC_OPENAPI_URL`), the `.env.example` variables, content layout, dev, build and preview commands. Incomplete: no prerequisites, `API_BASE_URL`, testing or release process; this file takes precedence until it is fixed | Commands, setup, configuration or the content layout change |
| `CLAUDE.md` (`AGENTS.md` is a symlink to it) | This guide, followed by the shared standards block. | See "Keeping documentation true" |
| `.env.example` | `PUBLIC_OPENAPI_URL`, with commented local (port 8500) and staging values (unset means production), and the server-only `DELEGATE_CLIENT_ID` / `DELEGATE_CLIENT_SECRET` pair | A variable is added, renamed or removed |
| `src/pages/index.astro` | The API reference at `/`: Scalar setup, theme and client picker. Endpoint text comes from payment | Scalar configuration or brand values change; endpoint wording changes in payment, not here |
| `src/content/guide/getting-started.mdx` | Account, token, digital quantity, twin and commodity via v4 curl, then loading, mounting and listening to a payment element. Partly out of date: staging CDN script, curl blocks that do not paste cleanly, `[TOC]`, and links to `/reference/payment-node`, which has no page | The v4 setup endpoints or the payment-js load flow change |
| `src/content/guide/reactive-payment.mdx`, `transparent.mdx` | Pay to keep watching a video; a transparent payment button over existing content. Out of date: staging CDN script, `[TOC]`, `(#)` links, and `reactive-payment` calls `element.toggle()`, which payment-js does not provide; payment-js takes precedence until they are fixed | Payment element options, methods or events change |
| `src/content/guide/trie-donation-example.mdx`, `vite-react-donation-example.mdx` | Complete donation pages: static HTML loading `micropay.js` from the production CDN, and Vite + React + TypeScript using payment-js from npm | payment-js's load flow, element options or events change |
| `src/content/guide/personas.mdx`, `src/pages/guide/example/*-persona.astro` | What personas are, with three iframed demos (signup and delegate, verify by level, verify to purchase); the signup demo posts to `/api/delegate` | Persona delegation, the verify element or `/api/delegate` change |
| `src/content/reference/payment-js/payment-element.mdx` | Live payment element, then create, mount and the `payment` event. It calls the server check `validatePayment`; payment-node's method is `Payment.validPayment` | Payment element options or events change |
| `src/content/reference/payment-js/auth-element.mdx` | Live auth element and the `authorized` event, then a paywall request with the session. Out of date: it sends `amount` alone, which `POST /v4/paywall` no longer accepts, and one sample sets a `Cookie` header, which browsers drop; the API reference at `/` takes precedence until it is fixed | The auth element or the v4 paywall request changes |
| `src/content/reference/payment-js/_payback-element.mdx` | Unpublished (leading `_`): payback element, consent, `destroy()` and dark mode | Publishing it or changing payback element options |
| `src/content/reference/payment-node/usage.mdx` | Constructor, `Commodity.createCommodity`, `Payment.validPayment`. Out of date: Installation has no command, the Twins sections are empty, and the `validPayment` sample has no `await` and no `timestamp`; the installed package takes precedence until it is fixed | payment-node's API changes |

<!-- BEGIN QATOM ORG STANDARDS v1 (public edition) — identical in every public TODAQmicro repo; change all copies together -->
## Qatom engineering standards

These rules apply to every TODAQmicro repo. Where a repo-specific section above differs, the repo section wins: it is either stricter, or a recorded exception with its reason.

### This repo is public

Everything committed here is visible to the world. Never commit secrets, internal hostnames other than the documented public endpoints, internal architecture or infrastructure details, customer data, or code and text copied from private repos.

### Releases

- Merging to `main` is a release, whether a deploy or publish workflow ships it or users install straight from `main`. Treat it that way.
- Changes that depend on a new API or MCP tool ship only after that API or tool is live in production.
- Agents never push to `main` and never run deploys or publishes. Prepare them and hand them to a human with the exact command.

### Security

- No secrets in git, ever: keys, tokens, passwords, client secrets, private keys, `.npmrc` tokens, fixtures and doc examples. Use obvious placeholders like `<client-secret>`. If you find a committed secret, stop and tell a human. Deleting it is not enough; it must be rotated.
- Server-side secrets come from the runtime environment, never from source. Browser code is public, so only values that are meant to be public belong in client bundles.
- Client secrets, tokens and session material never go in logs, `console.*`, URLs or JS-readable cookies.
- Validate every external input at the boundary with a schema.
- Fail closed. In production, missing required config stops startup; never fall back to a default URL or an empty secret.
- When you inspect config or env files, print names, never values.
- Before committing, read `git diff --staged` for secrets. If gitleaks is installed, scan the staged changes with it too.

### Making changes

- Branch from `origin/main` with a `feat/`, `fix/`, `docs/` or `chore/` prefix. One concern per PR: keep refactors, renames and formatting out of feature and fix PRs.
- Follow the preferred pattern named in this repo's sections above. Do not introduce a new library, framework or pattern without updating this guide in the same PR.
- Run this repo's checks before pushing (commands are in the sections above). New logic ships with tests where the repo has them; a bug fix ships with a regression check.
- Delete what your change makes dead: no commented-out code, no stale files or unused dependencies left behind.
- No bare `TODO`s. Fix it now, or reference the issue that will.
- A PR description says what changed, why, and how it was verified (the commands actually run).

### Keeping documentation true

Documentation is part of the change. A PR is not done until the docs describe what it does. The "Where the documentation lives" section above lists this repo's docs.

| If you change… | Update in the same PR |
|---|---|
| a command or script | README and this file's Commands section |
| configuration (added, renamed, removed) | README configuration notes and this file |
| what a user or integrator sees (API usage, tool names, install steps) | the user-facing pages that describe it |
| the preferred way to do something | this file: name the new pattern and mark the old one legacy |
| something that cost you time to discover | one line in this file, written as a rule, not as a story |
| this shared standards block | every public repo's copy at once, with the version marker bumped |

Rules for this file:
- Accurate beats complete. Every command and path in it must work today. Run what you document.
- When something here is wrong, fix it in the same PR if it is small, otherwise flag it. Replace stale lines rather than appending corrections.
- Keep it short enough to be read every session. Review changes to it as carefully as code changes; agents follow it literally.

### Developer-friendliness

Every repo converges on these. When a change touches one of them, leave it meeting the standard.
- The README says what the repo is, then covers prerequisites with versions, setup, configuration, how to run and test, and how it is released.
- Node 24 is pinned in `.nvmrc` wherever Node is used.
- Build output is not committed.
- CLAUDE.md is the source and AGENTS.md is a symlink to it.

### Conventions

- The product is Qatom. New user-facing text says Qatom, not TODA or TODAQ.
- New and updated pages document the current public API (v4) and the current MCP tools. Never present internal or deprecated endpoints as the recommended path.
- Never hard-code `todaq.net` or `qatom.ai` where a config value or the documented public endpoint name will do.

### Working with agents

For developers:
- This file is the contract. If you want agents to behave a certain way every time, write it here, not in a chat. A correction you give twice belongs in this file.
- Give an agent a scoped task with a clear done-condition, and review its PR like a colleague's: tests actually run, docs updated, scope respected, no secrets.

For agents:
- Read before you write. Verify claims by running commands, and report results honestly, failures included. Say what you did not verify.
- Stay in scope, and flag unrelated problems rather than fixing them silently.
- If this guide and the code disagree, trust the code, then fix the guide in your PR or flag the mismatch.
<!-- END QATOM ORG STANDARDS v1 (public edition) -->
