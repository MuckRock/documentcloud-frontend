# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- CLAUDE.md shared standard v1 — canonical copy: squarelet/CLAUDE.md -->
## Code comments

Comments say **why**, not what. If the code already says it, delete the comment.

- **One or two short sentences.** If it needs a paragraph, it belongs in a
  doc comment, the PR description, or a doc under `docs/`.
- **Keep the consequence, drop the lead-in.** The clause naming what the
  code does is the half to cut; the clause saying what breaks otherwise is
  the half worth keeping.
- **Never describe code that is not there.** No "this used to...", no
  narrating the change, no explaining why something was removed. `git log`
  and the PR hold that.
- **No reasoning out loud.** Don't walk through scenarios, anticipate
  objections, or record the thought process behind a choice.
- **Do comment the surprising**: a constraint an external system imposes,
  an ordering requirement, a failure that cannot be seen locally. That is
  what a reader cannot get from the code.

```typescript
// Good - a constraint you cannot see from here
// The API rejects a redaction whose page range crosses a document split.

// Bad - narrates the change
// `currentPage` is now derived from the store instead of a prop, so
// this component no longer needs to read it from context.
```

## Docstrings / doc comments

One line on what it does. Add more only for a contract a caller needs:
what it rejects/throws, what it returns in the edge case, ordering it
requires, side effects it has, a cost worth avoiding.

Two tests before you keep a second paragraph:

- Does it restate the first line in more words? Delete it.
- Would a caller behave differently for knowing it? Keep it, in one or two
  sentences.

```typescript
// Good - the whole contract, one line
/** Does the document still have pages pending OCR? */

// Good - a second paragraph a caller acts on
/**
 * The document's current processing status, or "error" if any page failed.
 *
 * Read from the cached store value; the document list renders one row
 * per document and cannot afford an API call each.
 */
```

## Pull request descriptions

Open with one sentence on what changes. Then:

- **Behaviour changes** — name them, or say "none".
- **Migrations** — what they do, whether they reverse.
- **What to check** — the QA steps, as a checklist.

Bullets, not prose. Don't recount how the change came about or what was
tried first.

## Tests

Name the behaviour, not the mechanism: `renders the error state when
OCR fails`, not `test handle error`. A test whose assertion would pass
against the unfixed code is not a test.
<!-- /CLAUDE.md shared standard -->

## Development Commands

### Local Development (Docker-based)

- `make install` - Install dependencies in Docker container
- `make dev` - Start the development server with Docker (requires local backend setup)
- `make build` - Build the production version in Docker
- `make down` - Stop Docker containers
- `make clean` - Remove build output, copied embed bundles in `static/`, and test/coverage reports

### Direct NPM Commands

- `npm run dev` - Start development server (NODE_ENV=development)
- `npm run dev:remote` - Start dev server against staging API (requires HTTPS setup)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Testing

- `npm run test` or `npm run test:unit` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:dev` - Run tests in watch mode with coverage
- Update snapshots: `npm run test:unit -- -u`

### Code Quality

- `npm run check` - Type checking with svelte-check
- `npm run check:watch` - Type checking in watch mode
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run knip` - Find unused files and dependencies

### Storybook

- `npm run storybook` - Start Storybook dev server
- `npm run build-storybook` - Build Storybook for production

## Architecture Overview

### Framework Stack

- **SvelteKit** with TypeScript for the main application
- **Vitest** for unit testing with jsdom environment
- **Storybook** for component development and documentation
- **Vite** as the build tool
- **Playwright** for browser testing

### Project Structure

- `src/lib/` - Reusable components, utilities, and API modules
- `src/routes/` - SvelteKit routes and pages
- `src/embed/` - Embed scripts (built separately with esbuild). These run on other sites to embed our application.
- `src/legacy/` - Legacy utilities and components. We keep these files for reference but no live code uses or imports them.
- `src/config/` - Environment-specific configuration files
- `src/langs/` - Internationalization files

### Key Directories

- `src/lib/api/` - API client functions with corresponding tests in `tests/` subdirectories
- `src/lib/components/` - Organized by feature (accounts, addons, common, documents, etc.)
- Each component directory typically contains:
  - Component `.svelte` files
  - `stories/` - Storybook stories
  - `tests/` - Unit tests with snapshots

### Configuration

- **Environment Variables**: Use `PUBLIC_` prefix for client-side variables
- **Path Aliases**:
  - `$lib/*` and `$lib` map to `./src/lib/*` and `./src/lib` (SvelteKit standard, preferred)
  - `@/*` and `@` map to `./src/*` and `./src` (legacy, avoid for new lib imports)
- **VSCode Integration**: Configured to prefer `$lib/` over `@/lib` for auto-imports
- **Docker Support**: Set `DOCKER=true` for containerized development
- **Test Environment**: UTC timezone enforced for consistent test runs

### Development Modes

1. **Local Stack**: Full Docker setup with local backend dependencies
2. **Remote Stack**: Frontend only, connecting to staging API with HTTPS certificates

### Build Process

- Main build uses Vite/SvelteKit
- Embed scripts built separately with esbuild via `embeds.js`
- Adapter configured for Cloudflare Workers deployment

### Testing Strategy

- Unit tests colocated with components in `tests/` directories
- Snapshot testing for component rendering
- Coverage reporting with v8 provider
- Browser tests with Playwright (not included in main test command)

### Code Organization Patterns

- API modules follow consistent structure with separate test files
- Components organized by domain/feature area
- Stories and tests colocated with components for discoverability
- Legacy code isolated in separate directories

#### Component Organization
- **Common/reusable components** live in `src/lib/components/common/` (Button, Badge, Banner, etc.)
- **Feature-specific components** organized by domain (sidebar, navigation, documents, addons, accounts, etc.)
- **Cross-cutting UI patterns** consistently applied (NavItem used across navigation, sidebars, menus, dropdowns)
- **Semantic naming** - components named for their function rather than original location

#### Import Path Conventions
- **Absolute imports** using `$lib/` alias for cross-domain component imports
- **Relative imports** for closely related components within the same feature area
- **Consistent barrel exports** from common directories to simplify imports
- **Systematic path updates** when components are moved between directories

#### Component Migration and Refactoring
- Components can be **safely relocated** between directories as their purpose evolves
- **Import paths systematically updated** throughout codebase when components move
- **Storybook stories migrate with components** to maintain documentation consistency
- **Semantic renaming** follows function over original location (e.g., SidebarItem → NavItem)

#### Code Quality and Formatting
- **Integrated automatic formatting** runs on file changes
- **Consistent code style** enforced across the entire codebase
- **Linting integration** with IDE and development workflow
