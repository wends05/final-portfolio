# Spec: Homepage intro animation

Change ID: 003-intro-animation
Status: Draft
Intent: [intent.md](intent.md)
Plan: [plan.md](plan.md)

## Current behavior

Source inspected on 2026-10-04:

- `src/routes/__root.tsx`: `RootDocument` renders `<html lang="en">` with `<HeadContent />` in `<head>`.
- `src/routes/_public/route.tsx`: the `_public` layout runs the site gate, then renders `RootLayout` (`Navbar`, `<Outlet />`, `Footer`). It wraps `/`, `/projects`, `/projects/$` and `/skills`.
- `src/routes/_public/index.tsx`: the loader returns `[ProjectsSection, SkillsSection]`; `Home` renders `HeroSection`, `DescriptionSection` and both composite sections.
- `src/features/public/components/landing/HeroSection.tsx`: placeholder `<div>HeroSection</div>`.
- `src/features/public/intro.functions.tsx` (untracked): `getIntroCookie` / `markIntroSeen` set and read a session cookie, `INTRO_COOKIE`. It isn't called anywhere. A session cookie survives closing a tab, so it can't meet Q1.
- `src/lib/gsap.ts`: registers `useGSAP` and `CustomEase` and creates the `swiss` ease (`0.2,0,0,1`, the same curve as `--ease-swiss`). Nothing imports it yet. Installed: `gsap` 3.15.0, `@gsap/react` 2.1.2. `useGSAP` runs in a layout effect, after hydration and before the browser paints that commit.
- `src/styles/portfolio.css` defines `text-display-xl`, `text-lead`, `type-label`, `type-index` and the colour roles the design uses.
- In local dev the `_public` layout redirects to `/coming-soon` while the site gate is on.

## Proposed behavior

The curtain plays once per browser tab, on the first public page the tab loads. `sessionStorage` is scoped to one tab: it survives reloads and in-tab navigation, and is cleared when the tab closes. GSAP drives every animation.

```mermaid
sequenceDiagram
    participant H as Inline head script
    participant P as First paint (CSS)
    participant G as GSAP (after hydration)
    participant S as sessionStorage
    H->>S: read "intro-seen"
    alt not seen in this tab
        H->>P: html[data-intro="play"]
        Note over P: curtain covers the page at 000; hero parts hidden
        G->>G: curtain timeline: label, counter 0→100, bar, lift at 1.55 s
        G->>G: hero timeline, delayed 1.7 s
        G->>S: on curtain complete: write "intro-seen"
        G->>P: html[data-intro="seen"], curtain unmounts
    else seen (reload or same tab)
        H->>P: html[data-intro="seen"]
        Note over P: no curtain; hero parts hidden
        G->>G: hero timeline, no delay
    end
```

| Visitor action | Curtain |
| --- | --- |
| Opens the site in a new tab, or reopens it after closing the tab | Yes |
| Reloads, or navigates between public pages in the same tab | No |
| Duplicates the tab | No; browsers copy `sessionStorage` into the duplicate |
| Quits the browser and restores tabs | Restored tabs: no. New tabs: yes |
| JavaScript disabled | No curtain; the hero shows in its final state with no animation |
| Opens `/coming-soon` (owner request, 2026-10-04) | Same curtain and per-tab flag as the public pages |

Timeline, measured from when GSAP starts (hydration), matching the canvas at pace 1. The hero delay is 1.7 s when the curtain plays and 0 when it doesn't.

| Element | Tween | Position | Duration | Ease |
| --- | --- | --- | --- | --- |
| Curtain label "Rence — portfolio" | `autoAlpha` 0 → 1 | 0 | 0.3 s | `none` |
| Counter 000 → 100 | object tween, `onUpdate` writes text | 0 | 1.4 s | `power3.inOut` |
| Progress bar | `scaleX` 0 → 1 | 0 | 1.4 s | `power3.inOut` |
| Curtain | `yPercent` 0 → −100 | 1.55 s | 0.8 s | `curtain` (CustomEase `0.76,0,0.24,1`) |
| Name "Rence", per letter | `yPercent` 105 → 0, stagger 0.05 s | hero + 0.1 s | 0.8 s | `swiss` |
| Eyebrow "Full-stack developer" | `autoAlpha` 0, `y` 12 → 0 | hero + 0.2 s | 0.5 s | `swiss` |
| Lead sentence | `autoAlpha` 0, `y` 12 → 0 | hero + 0.6 s | 0.5 s | `swiss` |
| Heavy rule | `scaleX` 0 → 1 | hero + 0.75 s | 0.7 s | `swiss` |
| Meta row "Portfolio · 2026" | `autoAlpha` 0, `y` 12 → 0 | hero + 1.0 s | 0.5 s | `swiss` |
| Highlight: ink block, then text colour | `scaleX` 0 → 1; ink → paper | hero + 1.05 s | 0.3 s | `swiss` |

On `/projects` or `/skills` the curtain lifts to show that page; only the homepage has the hero reveal.

States:

- **Before hydration:** the head script has already chosen `play` or `seen`. CSS shows the curtain at `000` (play only) and keeps the hero parts hidden, so nothing flashes in its final state before GSAP takes over.
- **JavaScript disabled:** the head script doesn't run, so no `data-intro` attribute exists. The curtain stays `display: none` and the hero renders fully.
- **Head script runs but the app bundle fails:** a 10 s CSS fail-safe hides the curtain and reveals the hero. GSAP cancels the fail-safe when it starts.
- **While the curtain plays:** `html[data-intro="play"]` sets `overflow: hidden` from first paint, so the page can't scroll and no scrollbar shows. After hydration, the navbar, page and footer are `inert`, so Tab can't reach links hidden behind the curtain. Both are lifted when the timeline completes. `html { scrollbar-gutter: stable }` keeps the layout from jumping when a classic scrollbar returns.
- **Reduced motion:** a `gsap.matchMedia()` branch swaps every movement for a fade, and the curtain fades instead of lifting. Timing is unchanged.
- **Leaving or reloading mid-curtain:** the flag is written only on the curtain timeline's `onComplete`, so the curtain plays again.

## Acceptance criteria

- AC-01: Loading any public page in a fresh tab shows a full-viewport curtain: a mono counter rising from `000` to `100` with a progress bar, lifting away 1.55 s after GSAP starts.
- AC-02: When the curtain timeline completes, `sessionStorage["intro-seen"]` is `"1"`, `<html data-intro="seen">` is set, and the curtain element unmounts.
- AC-03: Reloading the tab, or navigating to another public page in it, shows no curtain at any point (no flash). On the homepage the hero timeline starts with no delay.
- AC-04: Closing the tab and opening the site in a new tab shows the curtain again.
- AC-05: The hero shows the eyebrow, the name as an `h1` with the accessible name "Rence", the lead with the inverted highlight, a 2px rule and the meta row. Styling uses the design-system utilities (`text-display-xl`, `text-lead`, `type-label`, `bg-rule`, `text-muted-foreground`).
- AC-06: With JavaScript disabled, the homepage shows the full hero and no curtain.
- AC-07: With `prefers-reduced-motion: reduce`, no element translates or scales; elements fade instead.
- AC-08: The curtain is `aria-hidden`; the hero is readable at a 375px width without horizontal scrolling; no hydration warning for `<html>`.
- AC-10: While the curtain plays, the page doesn't scroll, no scrollbar shows, and the content wrapper has `inert`. After completion, scrolling works and `inert` is gone.
- AC-11: `src/features/public/intro.functions.tsx` is deleted and nothing imports it.
- AC-09: `bun --bun run verify` shows no new failures against the baseline (`check` failing with 22 errors and 5 warnings; `lint:ds`, `typecheck` and `build` passing).

## Technical design

- **GSAP via `src/lib/gsap.ts`.** Components import `{ gsap, useGSAP }` from `#/lib/gsap` so the plugins and eases are registered once. Add a `curtain` CustomEase next to `swiss`.
- **Two timelines.** `IntroCurtain` and `HeroSection` each own a `useGSAP` timeline scoped to their root ref. Both start in the same hydration commit. The hero reads `<html data-intro>` once and delays by `INTRO_HERO_DELAY` (1.7 s) when it is `play`. They share timing constants from `src/features/public/intro.ts` rather than passing callbacks across the layout and route.
- **Per-tab memory, read before paint.** An inline `<head>` script sets `data-intro="play"` or `"seen"` from `sessionStorage`. `<html>` gets `suppressHydrationWarning`.
- **Pre-hydration CSS only.** `src/styles/intro.css` holds no keyframes for the intro itself. It sets the starting states that GSAP animates from: curtain visibility, hidden hero parts, the highlight's un-inked state, and the fail-safe. GSAP sets each element's final inline state, so after hydration the CSS starting states no longer matter.
- **Counter without React renders.** The tween updates a plain `{ n }` object, and `onUpdate` writes `textContent` through a ref. React never re-renders per frame.
- **Highlight as an element.** GSAP can't tween a `::before` pseudo-element, so the ink block is a real `aria-hidden` span behind the phrase. The text colour tweens to the resolved value of `--paper`, because GSAP can't interpolate `var()`.
- **No portal.** The curtain is `position: fixed` with `z-50`, so it already covers the navbar and footer wherever it sits in the tree. `createPortal` needs `document`, so it couldn't be server-rendered and the page would flash before the curtain. A portal also wouldn't stop scrolling or focus. Those come from the scroll lock and `inert`.
- **Scroll lock and `inert`.** The scroll lock is CSS keyed to `data-intro`, so it applies from first paint and lifts when `markIntroSeen()` sets `seen`. The server renders the content without `inert`, so a visitor with JavaScript off never gets a dead page. `RootLayout` turns it on in a layout effect, before the first post-hydration paint, when the curtain reports it is playing. Before hydration the overlay already blocks pointer input.
- **No server functions.** `intro.functions.tsx` is deleted (Q4), and the homepage loader is unchanged.

## Risks and resolved questions

- Q1, resolved: the curtain replays after the tab is closed. Implemented per tab with `sessionStorage`.
- Q2, resolved: the owner edits the hero wording after implementation. The canvas copy goes in as-is.
- Q5, resolved 2026-10-04: animate with GSAP rather than CSS keyframes, since the project already uses it.
- Q3, open (curtain colour): the canvas uses `#dddcd6`, which isn't a design-system token. The plan derives it as `color-mix(in srgb, var(--paper), var(--ink-black) 10%)`, about `#dddddb`.
- Q4, resolved: delete `intro.functions.tsx`.
- Q6, resolved: no portal; scroll lock plus `inert`.
- The intro now starts at hydration, not first paint. In production that gap is short. In dev, module loading can hold the curtain at `000` for a moment.
- Hero height: `min-h-svh` sits under the navbar, so the meta row starts about one navbar-height below the fold until the navbar is redesigned.
- A future Content Security Policy would need to allow the inline head script (hash or nonce).

## Acceptance record

Pending owner acceptance.
