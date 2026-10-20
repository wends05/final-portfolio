# Agent instructions

When writing a plan, include code blocks to explain the implementation. Include Mermaid diagrams in plans or explanations when they help visualize the implementation.

## Read the portfolio lore first

Start with [docs/README.md](docs/README.md), then read the documents relevant to the task before editing. The index covers product intent, architecture, development, data, UI, and decision records. Check [docs/intent.md](docs/intent.md) before choosing what to build or how it should behave. Use the words defined in [CONTEXT.md](CONTEXT.md) in code, docs, and conversation.

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
bun run test             # Vitest (Node.js)
bun --bun run verify     # check, lint:ds, typecheck, test, build; nonzero if any fail
bun run content          # Velite: validate content/ and regenerate .velite/
bun run new:project <slug>  # scaffold content/projects/<slug>/index.md as a draft
```

`verify` passes on `main`. Keep it passing: a change is not done while `verify` fails. Every pull request that changes behavior includes Vitest tests ([docs/decisions/0010-vitest-tests-in-every-pr.md](docs/decisions/0010-vitest-tests-in-every-pr.md)).

## Adding content

Content is files in `content/`, validated by Velite ([docs/data.md](docs/data.md), [ADR 0019](docs/decisions/0019-static-site-content-in-repo.md)). A content change is a pull request like any other.

1. **A project:** run `bun run new:project <slug>`. It creates `content/projects/<slug>/index.md` with `draft: true`. Fill in the frontmatter, then write the case study under Problem, Approach, and Result. Put images beside `index.md`, at most 2400px wide; every gallery image needs `alt`.
2. **A skill:** create `content/skills/<slug>.md` with `slug`, `name`, `confidence` (0 to 100), `tools`, and `draft: true` while it is not ready. The body is the overview.
3. **Tools and people:** add a new tool name once to `content/tools.yaml` (names match ignoring case), and a new collaborator to `content/collaborators.yaml`; projects credit them by slug.
4. **Homepage order:** list slugs in `content/site.yaml`: `featured` for projects, `topSkills` for skills. The homepage shows the first three of each.
5. **Preview:** set `VITE_SHOW_DRAFTS=true` in `.env.local` and run `bun --bun run dev`.
6. **Publish:** remove `draft: true`. Run `bun run content`, which names each invalid file or broken reference, then `bun --bun run verify`.

Agents: write only what the owner gave you. Placeholder text stays `draft: true` and is marked as a placeholder in the file.

## Rules

- Do not edit generated files by hand: `src/routeTree.gen.ts` (route generator), `.velite/`, and `public/static/` (Velite). See [docs/development.md](docs/development.md#generated-files) and [docs/data.md](docs/data.md).
- Keep server-only code in `*.server.ts` modules and server functions; UI receives plain data through route loaders and server functions. Do not use React Server Components or Bun-only runtime APIs ([docs/decisions/0011-no-react-server-components.md](docs/decisions/0011-no-react-server-components.md), [docs/decisions/0005-vercel-deployment.md](docs/decisions/0005-vercel-deployment.md)).
- Follow the feature folder layout in [docs/decisions/0009-feature-folder-structure.md](docs/decisions/0009-feature-folder-structure.md): `<feature>.server.ts`, `<feature>.functions.ts`, `utils`, `types`, `hooks/`, and `components/` per feature; shared code in `#/components` and `#/lib`.
- Never print or commit the contents of `.env`.
- `.delta/` holds tool-managed clones and worktrees. Do not edit, lint, or commit it.
- Pushing `main` deploys to production on Vercel ([docs/development.md](docs/development.md#vercel)). Don't push to `main`; all changes go through pull requests.
- Branches are `<type>/<short-name>` (`feat/navbar-links`), PR titles are conventional commits, and Linear issues go in the PR description (`Closes WD-21`, `Part of WD-13`). See [docs/sdlc.md](docs/sdlc.md#git-workflow) and [ADR 0012](docs/decisions/0012-trunk-based-pr-workflow.md). Never rename a branch with an open PR.

## Skills

- UI components and theming: use the `shadcn` and `base-ui` skills; `components.json` uses the `base-mira` style.

## Development workflow

- Read [docs/sdlc.md](docs/sdlc.md) before planning substantial work. Plan tasks in chat and record significant architectural decisions in `docs/decisions/`; separate per-change documents are not required.
- Record actual owner acceptance and implementation authorization; never infer acceptance from an agent-written status. Once authorized, continue routine work within scope without repeatedly asking permission.
- Define observable acceptance criteria, inspect relevant source, and update the plan and affected docs when the approach changes.
- Choose verification appropriate to the change. Record actual results, existing failures, regressions, and checks not run before reporting completion. A failing `verify` command remains a failure even when the cause predates the change.
- These are shared instructions for Codex and Claude Code. This project uses `AGENTS.md` directly; do not create a `CLAUDE.md` copy or wrapper.
