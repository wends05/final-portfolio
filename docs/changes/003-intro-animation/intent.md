# Intent: Homepage intro animation

Change ID: 003-intro-animation
Status: Draft
Owner: Repository owner
Date: 2026-10-04
Product direction: [Portfolio intent](../../intent.md)
Spec: [spec.md](spec.md)

## Problem

The homepage hero is a placeholder (`HeroSection` renders the text "HeroSection"), so a visitor gets no first impression of who the owner is. The owner designed three intro animations on the claude.ai Design canvas "Portfolio intro animation" (https://claude.ai/artifact/6YkQFyeyYJdZN5gVBfYFCZ) and chose option **A — Paper curtain**.

An untracked `src/features/public/intro.functions.tsx` has `getIntroCookie` and `markIntroSeen` server functions for an `INTRO_COOKIE` gate, but nothing calls them. That cookie is a session cookie, so it lasts until the whole browser closes, and session restore can keep it longer. It can't make the curtain return when only the tab closes.

## Desired outcome

The first public page a browser tab opens shows a short loading curtain (a 000 → 100 counter and progress bar) that lifts off to reveal the page. On the homepage the hero follows: name, role, a one-line description with an inverted highlight, a heavy rule and a meta row. Reloads and navigation within the same tab skip the curtain. Closing the tab and opening the site again shows it again.

## Scope and non-goals

In scope:

- The curtain, shown once per browser tab on whichever public page the tab opens first.
- A real `HeroSection` matching option A, animated on every homepage load.
- Reduced-motion behavior.
- While the curtain plays: no scrolling or scrollbar, and the page behind it is `inert`.
- Removing the unused `src/features/public/intro.functions.tsx`.

Out of scope:

- Options B (Typeset) and C (Grid build).
- The canvas's Replay button and Pace slider. They are design-review controls, not site features.
- Navbar, description section, footer and the other landing sections.
- Moving the hero copy into the database or the admin page.

## Constraints

- Follow [AGENTS.md](../../../AGENTS.md), [UI conventions](../../ui.md) and the Rence Portfolio tokens in `src/styles/portfolio.css` ([decision 0002](../../decisions/0002-portfolio-design-tokens.md)).
- The intent calls for a clean, minimal, typography-led look. The animation must not hide content when JavaScript is off or fails to load.
- Use GSAP through `src/lib/gsap.ts`, which registers the plugins and the `swiss` ease.
- Leave `src/styles/portfolio.css` unchanged; it mirrors the synced design system.
- No database changes.

## Open questions

Answered by the owner:

- Q1 (curtain frequency): play again whenever the tab is closed and the site reopened; if that weren't possible, at least whenever the public pages are opened. Per-tab is possible with `sessionStorage`, so this plan uses it.
- Q2 (hero copy): the owner will edit the wording themselves after implementation.
- Q5 (animation library): use GSAP, already set up in `src/lib/gsap.ts`.
- Q4 (unused file): remove `intro.functions.tsx`.
- Q6 (portal): no portal; lock scrolling and make the page behind the curtain `inert` instead.

Still open; listed in [spec](spec.md#risks-and-resolved-questions):

- Q3 (curtain colour): accept a derived shade, since the design system has no token for it?

## Acceptance record

Owner direction, 2026-10-04: implement option A from the canvas; plan first before implementing; the curtain replays when the tab is closed and reopened; the owner edits the hero wording; animate with GSAP; scroll lock and `inert` instead of a portal; remove `intro.functions.tsx`. A first implementation was started, then stopped and reverted at the owner's request. Intent not yet accepted.
