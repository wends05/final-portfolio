# Portfolio documentation

The portfolio lore lives here. These documents help future agents understand the code before changing it.

These docs describe where the portfolio is going and how to build it: product direction, conventions, and decisions. They do not track what is implemented today; read the code for that.

## Read by task

| Document | Read when |
| --- | --- |
| [Product intent](intent.md) | Deciding what to build, choosing between options, or checking whether a change fits the portfolio's goals |
| [User brief](agents/USER-BRIEF.md) | Documented user goals and assumptions that need confirmation before feature design |
| [Development workflow](sdlc.md) | Planning a substantial change, recording acceptance, selecting verification, or reporting completion |
| [Homepage plan](ui.md#homepage-plan) | Building homepage sections, the intro curtain, or the hero |
| [Architecture](architecture.md) | Planned routes, the coming-soon gate, data flow, and where code goes |
| [Development](development.md) | Setup, commands, checks, generated files, and dependency overrides |
| [Deployment](development.md#vercel) | Vercel setup, which branches deploy, environment variables, and what a push to `main` does |
| [Data](data.md) | Models, query rules, and schema changes |
| [UI conventions](ui.md) | Building sections, cards, navigation, or styles, or enabling design-system lint rules |
| [Decisions](decisions/README.md) | Recording a significant implementation choice and its rationale |

Read [../AGENTS.md](../AGENTS.md) first. For general orientation, continue through product intent and architecture; read the rest as needed.

## Documentation maintenance

- Update the relevant document in the same change as its code or configuration.
- Reference actual source files and commands. Keep secrets and connection strings out of documentation.
- Write direction, conventions, and rules. Do not record implementation status, placeholders, or check results; those belong in chat or the PR.
- Keep the product target in `intent.md`, conventions in the topic docs, and rationale in `decisions/`; avoid duplicating source files.
- Change `intent.md` only with the owner's agreement; agents should not invent goals.
- Add new topics to this index so future agents can discover them.

If the code and a convention here disagree, ask whether to change the code or the doc.
