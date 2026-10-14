# 0017: The `cn` package for class merging

Date: 2026-10-15
Status: Accepted

## Context

Every component builds its class string with `cn()` from [../../src/lib/utils.ts](../../src/lib/utils.ts). The shadcn template implemented it as `twMerge(clsx(inputs))`, with `tailwind-merge` extended to know the portfolio's `--text-*` sizes ([0002](0002-portfolio-design-tokens.md)). The owner decided on 2026-10-15 to replace that pair with the [`cn`](https://github.com/shadcn-ui/cn) package from shadcn, which merges classes the same way as `clsx` + `tailwind-merge` and runs faster.

## Decision

`cn` replaces `clsx` and `tailwind-merge` as a direct dependency. `src/lib/utils.ts` builds `cn()` with `createCn` from `cn/config`, which takes the same `{ extend, override, prefix }` shape as `extendTailwindMerge`:

```ts
import { createCn } from "cn/config";

export const cn = createCn({
	extend: {
		classGroups: {
			"font-size": [{ text: ["display-xl", "display-l", /* … */ "body-s"] }],
		},
	},
});
```

Components keep importing `cn` from `#/lib/utils` (the `utils` alias in [../../components.json](../../components.json)), so shadcn primitives and feature code do not change. Do not import `cn` from the `cn` package directly: the package default does not know the custom sizes and drops `text-display-l` next to a text colour.

## Alternatives

- **Keep `clsx` + `tailwind-merge`:** works, but two packages for one function, and slower merging on every render.
- **`export { cn } from "cn"` as the package README suggests:** loses the custom `font-size` group.
- **`cn build` (Vite plugin with compiled tables):** a smaller bundle, but it adds a build step and misses dynamically built class names. Not needed at this size.

## Consequences

- One dependency instead of two. `clsx` stays in `bun.lock` as a transitive dependency of `class-variance-authority` and the TanStack devtools.
- `cn` is pre-1.0, so `^0.4.0` allows only `0.4.x`. A `0.5` release can break the API and arrives in Dependabot's grouped minor pull request ([0016](0016-dependabot-dependency-updates.md)); read its changelog before merging.
- New `--text-*` tokens are still registered in `src/lib/utils.ts` ([../ui.md](../ui.md#styles-and-tokens)).

## Validation

[../../tests/lib/utils.test.ts](../../tests/lib/utils.test.ts) checks clsx-style inputs, conflict resolution, and that each custom size survives beside a text colour and merges with other sizes.
