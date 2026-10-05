# Portfolio documentation

The portfolio lore lives here. These documents help future agents understand the code before changing it.

Last review: **2026-10-05**. Source was inspected and `verify` was run; see the [baseline](development.md#baseline-2026-10-05). These checks did not inspect the running app, live database, or deployment. Database-specific evidence from separate work is recorded in [data](data.md).

Workflow simplified on **2026-10-05**: task plans live in chat, architectural rationale in ADRs, and historical evidence in topic docs. The same day, `verify` was rerun for a [fresh baseline](development.md#baseline-2026-10-05) and Vercel deployment was documented.

## Read by task

| Document | Read when |
| --- | --- |
| [Product intent](intent.md) | Deciding what to build, choosing between options, or checking whether a change fits the portfolio's goals |
| [User brief](agents/USER-BRIEF.md) | Documented user goals and assumptions that need confirmation before feature design |
| [Development workflow](sdlc.md) | Planning a substantial change, recording acceptance, selecting verification, or reporting completion |
| [Dependency audit history](development.md#dependency-security-2026-10-04) | Security overrides, remaining advisory, and historical verification |
| [Intro and motion notes](ui.md#intro-and-motion) | Current curtain implementation and remaining hero proposal |
| [Architecture](architecture.md) | Understanding entry points, routing, feature ownership, and server rendering |
| [Development](development.md) | Installing dependencies, running commands, linting, checking changes, building, or handling generated files |
| [Deployment](development.md#vercel) | Vercel setup, environment variables, and what a push to `main` does |
| [Data](data.md) | Changing database models, queries, contracts, or migrations |
| [UI conventions](ui.md) | Building sections, cards, navigation, or styles, or enabling design-system lint rules |
| [Current status](status.md) | Checking what exists, what is unfinished, and what needs verification |
| [Decisions](decisions/README.md) | Recording a significant implementation choice and its rationale |

Read [../AGENTS.md](../AGENTS.md) first. For general orientation, continue through product intent, architecture, and current status; read the remaining documents as needed.

## Documentation maintenance

- Update the relevant document in the same change as its code or configuration.
- Reference actual source files and commands. Keep secrets and connection strings out of documentation.
- Describe proposals as proposals until implemented. Report checks with their actual results.
- Keep current behavior in the topic docs, the target in `intent.md`, and durable rationale in `decisions/`; avoid duplicating entire source files.
- Change `intent.md` only with the owner's agreement; agents should not invent goals.
- Add new topics to this index so future agents can discover them.

Current source and configuration take precedence over an older documentation snapshot. If they disagree, investigate and update the docs.
