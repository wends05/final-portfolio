# UI conventions

Source snapshot: **2026-10-04**. The UI is still mostly scaffolding; these notes describe existing code rather than a finished design system.

## Styling and components

Styles come in two layers, recorded in [decision 0002](decisions/0002-portfolio-design-tokens.md):

1. [../src/styles/portfolio.css](../src/styles/portfolio.css) holds the Rence Portfolio design system: palette (`--ink-black`, `--paper`, `--steel-grey`, `--dim-grey`), semantic roles (`--surface`, `--text`, `--text-muted`, `--text-subtle`, `--surface-inverse`, `--rule`, `--rule-soft`, `--focus`…), the type scale, fonts and layout utilities.
2. [../src/styles.css](../src/styles.css) is the shadcn entry named in `components.json`. It imports Tailwind, animation utilities, shadcn styles, Outfit Variable, Geist Mono Variable and `portfolio.css`. Its light shadcn variables point at the portfolio roles (`--background: var(--surface)`, `--primary: var(--surface-accent)`, `--border: var(--rule-soft)`, `--ring: var(--focus)`). `--secondary`, `--muted`, `--accent`, `--destructive`, `--chart-*`, `--radius` and the whole `.dark` block keep their shadcn defaults.

| Need | Use |
| --- | --- |
| Page ground, text, muted text | `bg-background`, `text-foreground`, `text-muted-foreground` |
| Emphasis by inversion | `bg-primary text-primary-foreground`, or `bg-ink text-paper` |
| Footer and inverse blocks | `bg-inverse text-inverse-foreground`, secondary text `text-inverse-muted` |
| Hairlines | `border-rule` (primary), `border-rule-soft` (secondary); `border` = 1px, `border-2` = heavy rule |
| Ghost display type (24px+ only) | `text-subtle` |
| Display and reading type | `text-display-xl`, `text-display-l`, `text-display-m`, `text-heading-l`, `text-heading-m`, `text-heading-s`, `text-lead`, `text-body`, `text-body-s` |
| Geist Mono data styles | `type-label` (uppercase eyebrows, nav, buttons), `type-meta` (dates, tech lists), `type-index` (gallery counter), or `font-label` |
| Layout | `page-grid` (4 columns on phones, 12 from `md`), `max-w-grid` (1440px) |
| Motion | `ease-swiss` with `duration-150`/`200`/`300` |

- Each `text-*` size token carries line height, tracking and weight. Display sizes are fluid with `clamp()`; the other sizes step from phone to desktop values at 768px.
- Spacing uses Tailwind's default scale, which already matches the system's 4px steps (`p-4` = 16px, `p-24` = 96px).
- Base styles: `body` uses `text-body`; `h1`, `h2` and `h3` use `text-display-l`, `text-heading-l` and `text-heading-m`.
- `--font-heading` is the same as `--font-sans` (Outfit). The old `--color-navy` and `--color-ocean-blue` tokens and the Oxanium font were removed.
- shadcn primitives keep their rounded radius, while the design system squares everything except circular icon buttons. Use `rounded-none` in portfolio components.
- `cn()` in [../src/lib/utils.ts](../src/lib/utils.ts) registers the custom font sizes with `tailwind-merge`; add new `--text-*` tokens there too, or `cn()` may drop them as colour conflicts.
- `src/styles.css` and `src/styles/**` are excluded from Biome, whose CSS parser has Tailwind directives disabled.
- Dark styles are declared through `.dark`; no theme toggle was found.

[../components.json](../components.json) configures shadcn with Base UI (`base-mira`), CSS variables, and Phosphor icons. Reuse [../src/components/ui/button.tsx](../src/components/ui/button.tsx) for existing button variants and [../src/lib/utils.ts](../src/lib/utils.ts) for class merging with `cn()`.

## Design-system linting

`bun --bun run lint:ds` runs Oxlint with the `@shadcn/lint` plugin, configured in [../.oxlintrc.json](../.oxlintrc.json). The plugin discovers components and theme tokens from `components.json` and `src/styles.css`, and its error messages suggest fixes based on them.

No `shadcn/*` rules are enabled. Candidate rules are `no-arbitrary-values`, `no-raw-colors`, `no-unknown-classes`, `no-inline-styles`, `require-static-classes`, and `no-restyle`; see the [rule reference](https://github.com/shadcn-ui/lint/blob/main/README.md#rules). `no-restyle` normally needs an override that turns it off for `src/components/ui/**`, where primitives define their own classes.

A trial run with `no-arbitrary-values` enabled (not saved) reported two values in `button.tsx`: `text-[0.625rem]` and a `color-mix(...)` hover background. Expect to resolve or explicitly allow those when enabling that rule. Choosing rules is a design decision; record it in [decisions](decisions/README.md).

## Landing-page ownership

Sections and cards live in `src/features/public/components/landing/`. Shared chrome lives in `src/components/` and is composed by `RootLayout`.

| Component | Current behavior |
| --- | --- |
| `HeroSection` | One line of draft copy in an `intro-hero` container; no reveal animation |
| `DescriptionSection` | Placeholder text |
| `ProjectsSection` | Maps projects into the supplied ProjectCard; passes `coverImageKey` as `imageUrl` (empty string when absent). A storage key is not yet resolved to a public image URL. |
| `ProjectCard` | Takes no props and renders placeholder text; `ProjectsSection` still passes it `LandingProjectCard` props |
| `SkillsSection` | Maps skill categories into its imported SkillCard using `name` and `overview`, and shows a temporary heading |
| `SkillCard` | Renders title and description |
| `ContactSection` | Placeholder; not rendered by the homepage |
| `Navbar` | Renders icons from route configuration, without navigation links |
| `Footer` | Placeholder text |

Card prop contracts are in [../src/features/public/public.types.ts](../src/features/public/public.types.ts). Keep their callers aligned when changing props.

## Guidance for future implementation

Use semantic tokens and shared primitives where they fit. Keep page composition in routes and section-specific rendering in the feature folder. Turn navigation into semantic links with accessible labels; icons alone do not provide working navigation. Check keyboard focus, heading hierarchy, image alternatives, and small-screen layouts when implementing the placeholder UI.

Any new visual direction or behavior is a proposal until implemented. Record durable design choices in [decisions](decisions/README.md) and update [current status](status.md) when components become functional.

## Intro and motion

Source inspected during documentation consolidation on **2026-10-05**; no browser or runtime checks were run for this edit. These notes preserve useful intro context without treating the earlier draft plan as completed work.

- [IntroCurtain](../src/features/public/components/intro/IntroCurtain.tsx) is mounted by `RootLayout`. It uses GSAP through [../src/lib/gsap.ts](../src/lib/gsap.ts), with the `swiss` and `curtain` eases registered centrally.
- [Intro helpers](../src/features/public/lib/intro.ts) supply a dependency-free inline head script that reads `sessionStorage["intro-seen"]` before paint and sets `data-intro` to `play` or `seen`. Completion writes the flag and unmounts the curtain. This is tab-scoped state rather than a server cookie.
- The counter advances from `000` to `100` over 1.4 seconds from GSAP startup. The curtain starts lifting at 1.55 seconds and takes 0.8 seconds. The counter uses a ref rather than per-frame React state.
- [Intro CSS](../src/styles/intro.css) controls pre-hydration visibility and scroll lock. The layout makes background content `inert` while the curtain is active. A 10-second CSS fallback changes visibility if the app does not start; scroll/focus recovery still needs runtime verification.
- The reduced-motion branch fades the curtain instead of translating it; the progress bar still uses a scale tween. Do not claim that all motion is removed. With JavaScript disabled, no `data-intro` attribute is set and the curtain is hidden by default.

The earlier owner direction selected the paper-curtain concept, tab-scoped replay, GSAP, scroll lock, and `inert` without a portal. The owner intended to edit hero copy themselves. The draft hero proposal included a name, role, lead with inverted highlight, heavy rule, and meta row, with a reveal after the curtain; the inspected `HeroSection` currently renders text without that GSAP reveal. This remains unfinished, and the previous detailed timeline is not an accepted implementation requirement.

The source uses a derived curtain background (`color-mix` of paper and ink); the earlier draft left owner acceptance of that shade open. Before further intro/hero work, confirm the current scope and inspect fresh-tab/reload behavior, reduced motion, JavaScript failure/off states, scroll and focus recovery, mobile overflow, and hydration warnings.
