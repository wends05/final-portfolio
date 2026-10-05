# Agent instructions

When writing a plan, include code blocks to explain the implementation. Include Mermaid diagrams in plans or explanations when they help visualize the implementation.

## Read the portfolio lore first

Start with [docs/README.md](docs/README.md), then read the documents relevant to the task before editing. The index covers product intent, architecture, development, data, UI, and decision records. Check [docs/intent.md](docs/intent.md) before choosing what to build or how it should behave.

The docs describe direction, conventions, and decisions, not what is implemented today. Read the code for current behavior. Update the docs when a convention, plan, or decision changes; do not add implementation status or check results to them.

## Commands

Use Bun; the lockfile is `bun.lock`.

```bash
bun install
bun --bun run dev        # http://localhost:3000
bun --bun run check      # Biome: format, lint, import order
bun --bun run lint:ds    # Oxlint + @shadcn/lint (design-system rules)
bun --bun run typecheck  # TypeScript
bun --bun run build      # production build into .output/
bun --bun run verify     # all four checks; nonzero if any fail
```

`verify` passes on `main`. Keep it passing: a change is not done while `verify` fails. Every pull request that changes behavior includes Vitest tests ([docs/decisions/0010-vitest-tests-in-every-pr.md](docs/decisions/0010-vitest-tests-in-every-pr.md)).

## Rules

- Do not edit generated files by hand: `src/routeTree.gen.ts` (route generator) and `src/integrations/prisma/contract.json` / `contract.d.ts` (`contract:emit`). See [docs/development.md](docs/development.md#generated-files) and [docs/data.md](docs/data.md).
- Keep database access in `*.server.ts` modules and server functions; UI receives plain data through route loaders and server functions. Do not use React Server Components or Bun-only runtime APIs ([docs/decisions/0011-no-react-server-components.md](docs/decisions/0011-no-react-server-components.md), [docs/decisions/0005-vercel-deployment.md](docs/decisions/0005-vercel-deployment.md)).
- Follow the feature folder layout in [docs/decisions/0009-feature-folder-structure.md](docs/decisions/0009-feature-folder-structure.md): `<feature>.server.ts`, `<feature>.functions.ts`, `utils`, `types`, and `components/` per feature; shared code in `#/components` and `#/lib`.
- Ask before running anything that changes a database (`db:push`, `db:migrate`, `db:seed`, migration apply). Never print or commit `DATABASE_URL` or the contents of `.env`.
- `.delta/` holds tool-managed clones and worktrees. Do not edit, lint, or commit it.
- Pushing `main` deploys to production on Vercel ([docs/development.md](docs/development.md#vercel)). Push only when the owner asks.

## Skills

- Data layer work: use the project's `prisma-8` skill (Prisma Next, in `.agents/skills/` and mirrored for other agents). The runtime is Prisma Next, not traditional Prisma Client.
- UI components and theming: use the `shadcn` and `base-ui` skills; `components.json` uses the `base-mira` style.

## Development workflow

- Read [docs/sdlc.md](docs/sdlc.md) before planning substantial work. Plan tasks in chat and record significant architectural decisions in `docs/decisions/`; separate per-change documents are not required.
- Record actual owner acceptance and implementation authorization; never infer acceptance from an agent-written status. Once authorized, continue routine work within scope without repeatedly asking permission.
- Define observable acceptance criteria, inspect relevant source, and update the plan and affected docs when the approach changes.
- Choose verification appropriate to the change. Record actual results, existing failures, regressions, and checks not run before reporting completion. A failing `verify` command remains a failure even when the cause predates the change.
- These are shared instructions for Codex and Claude Code. This project uses `AGENTS.md` directly; do not create a `CLAUDE.md` copy or wrapper.
