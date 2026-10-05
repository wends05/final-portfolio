# 0008: Biome as the linter and formatter

Date: 2026-10-05
Status: Accepted

## Context

The project needs one tool for formatting, import order, and general lint rules. Biome was set up in the scaffold before decision records began; the owner confirmed it as the linter on 2026-10-05.

## Decision

Use Biome 2.5.15 for formatting, import sorting, and general linting, configured in [../../biome.json](../../biome.json):

- Formatter: tabs, double quotes.
- Linter: `recommended` preset, with `style/noNonNullAssertion` off.
- Assist: `organizeImports` on.
- Scope: `src/**`, root `scripts/**/*.mjs`, `vite.config.ts`, and `.vscode/**`. Excludes generated files (`src/routeTree.gen.ts`, `src/integrations/prisma/contract.json`, `contract.d.ts`), `src/styles.css`, `src/styles/*`, and `.delta/`. Agent skill folders (`.agents/`, `.claude/`, `.cursor/`, `.devin/`) are out of scope.

```bash
bun --bun run check    # format + lint + imports, read-only
bun --bun run format   # format only
bun --bun run lint     # lint only
```

Oxlint runs beside Biome for design-system rules only ([0001](0001-oxlint-for-design-system-lint.md)). The two do not overlap: Oxlint's default `correctness` rules are off.

## Alternatives

None were recorded. [0001](0001-oxlint-for-design-system-lint.md) rejected replacing Biome with Oxlint because Biome also formats.

## Consequences

- One fast tool covers formatting and general linting; there is no ESLint or Prettier config to maintain.
- Stylesheets are excluded because Biome's CSS parser does not have Tailwind directives enabled.
- Generated files are excluded, so `contract emit` output never fails the check. The hand-written `contract.ts` is checked.
- The scripts are read-only. Pass `--write` explicitly only when changes are intended.

## Validation

On 2026-10-05, after narrowing the scope and formatting nine files, `bun --bun run check` exited 0.
