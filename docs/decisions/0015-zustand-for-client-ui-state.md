# 0015: Zustand for shared client UI state

Date: 2026-10-09
Status: Accepted

## Context

The site menu (Linear WD-53) needs state that several parts of the page read: the top bar's Menu button, the menu panel, and later the section page transition (WD-51), which runs in GSAP outside React and must tell a menu pick apart from other navigation. React state in one component would have to be lifted to the layout and threaded through props, and GSAP code can't read it.

The scaffold shipped `@tanstack/store` and `@tanstack/react-store`, but no code imported either.

## Decision

Use [zustand](https://zustand.docs.pmnd.rs/) for UI state shared across components, and remove the unused TanStack Store packages. Chosen by the owner on 2026-10-06.

Each store module exports a factory and one app-wide instance. Components read it with `useStore`; non-React code calls `getState()` and `subscribe()`.

```ts
// src/features/public/utils/menu-store.ts
export const createMenuStore = () =>
  createStore<MenuState>()((set) => ({
    phase: "closed",
    close: () => set({ phase: "closed" }),
    toggle: () => set((s) => ({ phase: s.phase === "closed" ? "open" : "closed" })),
  }));

export const menuStore = createMenuStore();

// a component
const phase = useStore(menuStore, (s) => s.phase);
```

A module-level instance is shared by every request a server instance renders. Keep only state that starts the same for every visitor and changes in the browser in these stores. State that differs per visitor belongs in a per-request store: the router context, like the `QueryClient` from `getRouter()`, or a React provider that calls the factory.

## Alternatives

- **TanStack Store:** already installed and from the same family as the router. The owner chose zustand instead; no further reason was recorded.
- **React context and `useState` in the layout:** no dependency, but GSAP timelines outside React can't read it, and every reader re-renders on each change.
- **zustand's `create` hook:** one global store per module, which leaks state between Vitest tests unless each test resets it. The factory gives each test a fresh store.

## Consequences

- One small dependency. Stores are plain modules, unit-tested in Node without a DOM ([0010](0010-vitest-tests-in-every-pr.md)).
- WD-51's transition controller can read the menu phase directly.
- Visitor-specific state must not go in a module-level store.

## Validation

`menu-store.test.ts` covers the menu store's transitions and that each factory call returns a separate store.
