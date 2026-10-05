# Current implementation status

Last source review: **2026-10-05**. `bun --bun run verify` was run for the [current baseline](development.md#baseline-2026-10-05). It did not test the running app, database connectivity, or a deployment; separate database work is recorded in [data](data.md). Recheck this list against source before planning work; the scaffold has not reached its final form yet.

## Present in source

- TanStack Start, file-based Router, Query SSR integration, RSC configuration, React compiler, Tailwind CSS, and Nitro adapter.
- A public layout with shared navigation and footer.
- A homepage loader that requests project and skill composite sections concurrently.
- Project and skill query modules backed by a Prisma Next contract on Neon Postgres. The schema was applied and verified on 2026-10-04 ([data](data.md), [decision 0003](decisions/0003-neon-database-and-portfolio-schema.md)).
- A SkillCard that renders its supplied title and description.
- Portfolio design tokens (Rence Portfolio design system) layered under the shadcn variables, plus a reusable Base UI button; see [UI conventions](ui.md#styling-and-components).
- Biome for formatting and general lint, plus Oxlint with `@shadcn/lint` registered for design-system rules (no rules enabled yet).
- A production build that completes locally (Nitro `bun` preset) and with the Vercel preset.
- Vercel deployment from `main` to `portfolio.wends.dev`, with `vercel.json` selecting the Bun runtime ([development](development.md#vercel), [decision 0005](decisions/0005-vercel-deployment.md)).
- A coming-soon route and cookie/environment gate; its actual condition is documented in [architecture](architecture.md#routes).
- A shared `AGENTS.md` workflow, ADRs for significant architectural decisions, and aggregate `verify` command; see [sdlc.md](sdlc.md). Tasks are planned in chat; separate per-change records are not required. No PR CI or deployment automation is configured by this workflow.

These are source observations, not confirmation that all pieces work together at runtime.

## Unfinished or needs verification

| Area | Observed state | Implication for future work |
| --- | --- | --- |
| Landing UI | Hero, description, project cards, and footer show placeholder text | Portfolio content and presentation still need implementation |
| Contact | Placeholder component is not mounted | There is no implemented contact flow |
| Navigation | Icons are rendered without links | Configured paths do not provide clickable navigation |
| Skills and projects pages | Placeholder route components | Listings and project detail loading are unfinished |
| Dashboard routes | `_dashboard/home.tsx` and `_dashboard/auth/index.tsx` render generated placeholder text | No admin UI or authentication yet |
| Folder layout | A few files predate [decision 0009](decisions/0009-feature-folder-structure.md), such as `public/lib/intro.ts` | Align them when those files next change |
| Project server functions | `projects.functions.ts` is empty | No project-specific server-function API exists there |
| Skill component injection | SkillsSection declares a SkillCard prop but renders an imported SkillCard | Supplied card customization is not used |
| Simulated delay | `Promise.resolve(() => setTimeout(...))` resolves a function without invoking it | It does not implement the apparent five-second delay |
| Content | The Neon tables exist but hold no rows; no seed exists | The homepage shows empty project and skill lists until content is entered |
| Many-to-many reads | `ProjectSkill` joins projects and skills, but the installed Prisma Next cannot `.include()` across a junction | Use `db.sql` with an explicit join for skill lists on project pages |
| Coming-soon gate | `hasPreview = !token && cookie === token`; `gated = comingSoon && hasPreview` | Setting `PREVIEW_TOKEN` disables the gate, and a preview cookie never bypasses it. Fixing it is a code change. |
| Checks | Biome `check` fails; lint:ds, typecheck, and build pass | See [development](development.md#validation); rerun for current state |
| Design-system rules | `@shadcn/lint` is installed with no rules enabled | Choosing rules is still open; see [UI conventions](ui.md#design-system-linting) |
| Deployment | Vercel; `vercel.json` switches functions to the Bun runtime | The first deployment with the Bun runtime has not been checked; see [development](development.md#vercel) |

This list records observations; it does not authorize or prioritize fixes. For the intended end state and open product questions, see [product intent](intent.md). When completing an item, update this document and report what was actually validated.
