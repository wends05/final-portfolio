# Decision records

Use this folder for implementation choices whose rationale should survive future refactors. Examples include changing the rendering approach, redesigning model relationships, choosing a deployment host, or establishing a visual system.

| Record | Status |
| --- | --- |
| [0001: Oxlint for design-system lint alongside Biome](0001-oxlint-for-design-system-lint.md) | Accepted |
| [0002: Portfolio design tokens under the shadcn variables](0002-portfolio-design-tokens.md) | Accepted |
| [0003: Neon as the database host and the portfolio schema](0003-neon-database-and-portfolio-schema.md) | Accepted |
| [0004: Repository-based development workflow](0004-repository-based-sdlc.md) | Accepted |
| [0005: Vercel deployment with the Bun runtime](0005-vercel-deployment.md) | Accepted |
| [0006: TanStack Start as the application stack](0006-tanstack-start-application-stack.md) | Accepted |
| [0007: shadcn/ui as the component and token base](0007-shadcn-component-and-token-base.md) | Accepted |
| [0008: Biome as the linter and formatter](0008-biome-linter-and-formatter.md) | Accepted |
| [0009: Feature-based folder structure](0009-feature-folder-structure.md) | Accepted |

Some choices made before these records began were recorded on 2026-10-05 (0006–0009) with the owner's stated reasons. Do not invent reasons for other earlier choices; existing architecture is documented in [../architecture.md](../architecture.md). Add each new record to the table above.

Name new records `NNNN-short-topic.md`, starting with `0001`. Use this template:

```markdown
# 0001: Decision title

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded

## Context

What concrete problem or requirement led to this choice?

## Decision

What was chosen, and where is it implemented?

## Alternatives

What relevant options were considered, and why were they not chosen?

## Consequences

What benefits, costs, limitations, and follow-up work result?

## Validation

What was checked, and what remains unverified?
```

Add a Mermaid diagram or code example when it clarifies the choice. Mark a record accepted only when the decision has actually been made. Link superseded records to their replacements and update the current topic docs to reflect the implemented behavior.
